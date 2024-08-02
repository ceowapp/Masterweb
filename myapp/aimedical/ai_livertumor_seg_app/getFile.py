import os

def check_file_exists(file_name, source_folder):
    """
    Check if a specific file exists in a folder.

    Parameters:
    - file_name (str): Name of the file you want to check.
    - source_folder (str): Path to the source folder.

    Returns:
    - exists (bool): True if the file exists, False otherwise.
    """
    # Construct the source path.
    source_path = os.path.join(source_folder, file_name)

    try:
        # Check if the file exists.
        exists = os.path.isfile(source_path)
        if exists:
            print(f"File '{file_name}' exists in '{source_folder}'.")
            return True
        else:
            print(f"File '{file_name}' not found in '{source_folder}'.")
        return exists
    except Exception as e:
        print(f"Error: {e}")
        return False

