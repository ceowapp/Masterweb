import os
import shutil

def save_file_to_folder(file_name, source_folder, target_folder):
    """
    Save a specific file from a folder to another folder.

    Parameters:
    - file_name (str): Name of the file you want to save.
    - source_folder (str): Path to the source folder containing the file.
    - target_folder (str): Path to the target folder where you want to save the file.
    """
    # Ensure the target folder exists; create it if not.
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)

    # Construct the source path.
    source_path = os.path.join(source_folder, file_name)

    # Construct the destination path.
    destination_path = os.path.join(target_folder, file_name)

    try:
        # Copy the file to the target folder.
        shutil.copy2(source_path, destination_path)
        print(f"File '{file_name}' from '{source_folder}' saved to '{target_folder}'.")
    except FileNotFoundError:
        print(f"Error: File '{file_name}' not found in '{source_folder}'.")
    except Exception as e:
        print(f"Error: {e}")

