import gzip
import hashlib

from io import BytesIO

def get_url(data: bytes) -> str:
    decompressed_data = decompress(data)    
    return hashlib.sha256(decompressed_data).hexdigest()

def get_ids(data: bytes) -> list[int]:
    decompressed_data = decompress(data)
    return [int(x) for x in decompressed_data.split()]

def decompress(data: bytes) -> bytes:
    compressed_stream = BytesIO(data)
    with gzip.GzipFile(fileobj=compressed_stream, mode='rb') as decompressed_stream:
        decompressed_data = decompressed_stream.read()
    return decompressed_data
