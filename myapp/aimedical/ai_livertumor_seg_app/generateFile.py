import os
import random
import string

def generateRandomID(length=6):
    """Generate a random ID of the specified length."""
    characters = string.ascii_letters + string.digits
    random_id = ''.join(random.choice(characters) for _ in range(length))
    return random_id

def makeTempDir(base_path='.', prefix='temp'):
    """Create a temporary directory with a random name."""
    random_id = generateRandomID()
    temp_dir_name = f'{prefix}_{random_id}'
    temp_dir_path = os.path.join(base_path, temp_dir_name)

    try:
        os.makedirs(temp_dir_path)
        print(f'Temporary directory created: {temp_dir_path}')
        return temp_dir_path
    except OSError as e:
        print(f'Error creating temporary directory: {e}')

# Example usage:
temp_dir = makeTempDir(prefix='temp')
