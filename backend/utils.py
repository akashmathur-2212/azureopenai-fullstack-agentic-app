from docling.document_converter import DocumentConverter
from llama_index.core.schema import TextNode
import re
import os
from huggingface_hub import login
import uuid
import json
import pandas as pd
import nltk
from config import (
    red_flags_filepath,
    red_flags_highlight_style,
    red_flags_highlight_template,
)

from nltk.corpus import stopwords

nltk.download("stopwords")
login(token="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")


def get_unique_file_id(file):
    # Just remove extension, or use a hash for full uniqueness
    name = os.path.splitext(os.path.basename(file.filename))[0]
    # unique_suffix = uuid.uuid4()
    # name = f"{base_name}_{unique_suffix}"
    return name


def read_data_and_return_tbc(file):

    converter = DocumentConverter()
    result = converter.convert(file)
    document_text = result.document.export_to_markdown()

    text_lines = document_text.splitlines()

    headings = [x for x in text_lines if "#" in x]
    tbc_pattern = r"^#+\s+\d+\.\d+"

    # Filter lines matching the pattern
    table_of_contents = [
        item.replace("#", "").replace("amp", "").strip().title()
        for item in headings
        if re.match(tbc_pattern, item)
    ]

    table_of_contents = [re.sub(r"[^a-zA-Z ]+", "", item) for item in table_of_contents]
    table_of_contents = sorted(list(set(table_of_contents)))

    return document_text, table_of_contents


def create_data_chunks(document_text):

    SPLIT_PATTERN = "\n#"
    page_pattern = r"Page\s+\d+\s+of\s+\d+"
    document_text = re.sub(page_pattern, "", document_text)

    chunks = document_text.split(SPLIT_PATTERN)

    repeat_count = 5
    repeated_text = {}

    text_lines = document_text.splitlines()

    for text in text_lines:
        if text in repeated_text:
            repeated_text[text] += 1
        else:
            repeated_text[text] = 1

    repeated_text_list = []
    for k, v in repeated_text.items():
        if k not in stopwords.words("english") and v > repeat_count and k != "":
            repeated_text_list.append(k)

    # Compile pattern: escape special characters and join with |
    pattern = re.compile(
        r"(" + "|".join(re.escape(word) for word in repeated_text_list) + r")"
    )

    chunks_cleaned = [pattern.sub("", chunk).strip() for chunk in chunks]
    chunks_cleaned = [
        re.sub(r"\s{2,}", " ", chunk) for chunk in chunks
    ]  # removing >2 whitespaces ## RED FLAG

    nodes = []

    for i, chunk in enumerate(chunks_cleaned):
        chunk = chunk.strip()
        if chunk.startswith("#"):
            chunk = f"#{chunk}"  # add the # back to the chunk

        node = TextNode(text=chunk, id_=str(i))
        nodes.append(node)

    return nodes


# Function to highlight red flag in description
def highlight_red_flag(description, red_flag):
    if pd.isna(description) or pd.isna(red_flag):
        return description
    # Create a regex pattern to match the red_flag as a whole word (case insensitive)
    pattern = re.compile(rf"\b({re.escape(red_flag)})\b")
    # Replace with highlighted span
    return pattern.sub(
        lambda x: red_flags_highlight_template.format(x.group(1)), description
    )


def generate_red_flags(nodes):

    red_flags = pd.read_parquet(red_flags_filepath)

    red_flags_dict = dict(zip(red_flags["Red Flag words"], red_flags["Desciption"]))
    red_flags_dict_lower = dict(zip(red_flags["Lower"], red_flags["Desciption"]))
    red_flags_dict_upper = dict(zip(red_flags["Upper"], red_flags["Desciption"]))
    red_flags_dict_title = dict(zip(red_flags["Title"], red_flags["Desciption"]))

    # red flag list
    red_flag_all = []
    red_flag_all.extend(list(red_flags["Red Flag words"]))
    red_flag_all.extend(list(red_flags["Lower"]))
    red_flag_all.extend(list(red_flags["Upper"]))
    red_flag_all.extend(list(red_flags["Title"]))

    red_flag_list = sorted(list(set(red_flag_all)))

    # red flag nodes
    red_flag_nodes = {}

    for node in nodes:
        for flag in red_flag_list:
            if flag in node.text:
                if flag in red_flag_nodes:
                    red_flag_nodes[flag].append(node.text)
                else:
                    red_flag_nodes[flag] = []
                    red_flag_nodes[flag].append(node.text)

    # red flag DF
    col_name = "Paragraph_"
    rf_out = pd.DataFrame.from_dict(red_flag_nodes, orient="index")
    rf_out.columns = [f"{col_name}{x}" for x in range(1, len(rf_out.columns) + 1)]
    rf_out = rf_out.reset_index().rename(columns={"index": "Red Flag"})
    rf_out["Description"] = rf_out["Red Flag"].replace(red_flags_dict)
    rf_out["Description"] = rf_out["Description"].replace(red_flags_dict_lower)
    rf_out["Description"] = rf_out["Description"].replace(red_flags_dict_upper)
    rf_out["Description"] = rf_out["Description"].replace(red_flags_dict_title)

    df_para_cols = [col for col in rf_out.columns if col_name in col]
    for col in df_para_cols:
        # Apply it
        rf_out[col] = rf_out.apply(
            lambda row: highlight_red_flag(row[col], row["Red Flag"]), axis=1
        )

    df_nonpara_cols = [col for col in rf_out.columns if col_name not in col]

    rf_out = pd.concat([rf_out[df_nonpara_cols], rf_out[df_para_cols]], axis=1)
    rf_out = rf_out.sort_values("Red Flag").reset_index(drop=True)

    # Convert to JSON
    rf_json = rf_out.to_json(orient="records")
    parsed = json.loads(rf_json)

    # Convert to String
    red_flags_str_lst = []

    for idx, d in enumerate(parsed, start=1):
        red_flags_str = ""

        for key, value in d.items():
            if value is not None:
                if key == "Red Flag":
                    red_flags_str += f"<h3>{key} #{idx}: {value}</h3>\n"
                elif key == "Description":
                    red_flags_str += f"<h4>{key}: {value}</h4>\n"
                else:
                    if "Reference:" not in red_flags_str:
                        red_flags_str += f"<h4>Reference:</h4>\n<p>{value}</p>\n"
                    else:
                        red_flags_str += f"<p>{value}</p>\n"

        red_flags_str = red_flags_str.replace("## ", "")
        red_flags_str = red_flags_str.replace(
            key,
            f'<span style="font-weight: bold; background-color: yellow;">{key}</span>',
        )
        red_flags_str_lst.append(red_flags_str)

    show_red_flags = "\n".join(red_flags_str_lst)
    show_red_flags = f"<h2>Red Flags Found : {rf_out.shape[0]}</h2>\n" + show_red_flags

    return show_red_flags
