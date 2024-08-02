import os
import shutil

def save_file_to_folder(file_path, target_folder):
    """
    Save a file to a specific folder.

    Parameters:
    - file_path (str): Path to the file you want to save.
    - target_folder (str): Path to the target folder where you want to save the file.
    """
    # Ensure the target folder exists; create it if not.
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)

    # Extract the file name from the original path.
    file_name = os.path.basename(file_path)

    # Construct the destination path.
    destination_path = os.path.join(target_folder, file_name)

    try:
        # Copy the file to the target folder.
        shutil.copy2(file_path, destination_path)
        print(f"File '{file_name}' saved to '{target_folder}'.")
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
    except Exception as e:
        print(f"Error: {e}")

# Example usage:
file_path_to_save = '/path/to/your/file.txt'
target_folder_path = '/path/to/your/target/folder'
save_file_to_folder(file_path_to_save, target_folder_path)
