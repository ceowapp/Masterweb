def overwriteFile(source_file_path, destination_file_path):
    """Overwrite the content of the destination file with the content of the source file."""
    try:
        with open(source_file_path, 'r') as source_file:
            source_content = source_file.read()

        with open(destination_file_path, 'w') as destination_file:
            destination_file.write(source_content)

        print(f'File overwritten: {destination_file_path}')
    except Exception as e:
        print(f'Error overwriting file: {e}')
