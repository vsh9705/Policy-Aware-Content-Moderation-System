"""
Policy store management using Chroma vector database
"""
import os
import shutil
from pathlib import Path
from typing import List
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from django.conf import settings
import logging

logger = logging.getLogger('moderation')

POLICY_STORE_DIR = str(settings.POLICY_STORE_DIR)
EMBEDDING_MODEL = settings.EMBEDDING_MODEL
CHUNK_SIZE = settings.CHUNK_SIZE
CHUNK_OVERLAP = settings.CHUNK_OVERLAP

def get_embeddings():
    """
    Get embedding function
    """
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

def build_or_update_policy_store(file_paths: List[str]) -> Chroma:
    """
    Load policy PDFs, split into chunks, embed, and persist to policy_store.
    Appends to existing store if present.
    
    Args:
        file_paths: List of file paths to policy PDFs
        
    Returns:
        Chroma vectorstore instance
    """
    logger.info(f"Building/updating policy store with {len(file_paths)} files")
    
    # Load all documents
    docs = []
    for file_path in file_paths:
        try:
            loader = PyPDFLoader(file_path)
            docs.extend(loader.load())
            logger.debug(f"Loaded {file_path}")
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            raise
    
    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP
    )
    texts = text_splitter.split_documents(docs)
    logger.info(f"Split into {len(texts)} chunks")
    
    # Get embeddings
    embeddings = get_embeddings()
    
    # Create or update store
    if os.path.exists(POLICY_STORE_DIR) and os.listdir(POLICY_STORE_DIR):
        logger.info("Updating existing policy store")
        store = Chroma(
            persist_directory=POLICY_STORE_DIR,
            embedding_function=embeddings
        )
        store.add_documents(texts)
        store.persist()
    else:
        logger.info("Creating new policy store")
        store = Chroma.from_documents(
            texts,
            embeddings,
            persist_directory=POLICY_STORE_DIR
        )
        store.persist()
    
    logger.info("Policy store updated successfully")
    return store

def load_policy_store() -> Chroma:
    """
    Load existing policy store.
    
    Returns:
        Chroma vectorstore instance
        
    Raises:
        FileNotFoundError: If policy store is empty
    """
    embeddings = get_embeddings()
    
    if os.path.exists(POLICY_STORE_DIR) and os.listdir(POLICY_STORE_DIR):
        logger.info("Loading existing policy store")
        return Chroma(
            persist_directory=POLICY_STORE_DIR,
            embedding_function=embeddings
        )
    else:
        logger.error("Policy store is empty")
        raise FileNotFoundError("Policy store is empty. Upload policy PDFs first.")

def clear_policy_store() -> bool:
    """
    Remove the persisted policy store (full reset).
    
    Returns:
        True if successful
    """
    logger.info("Clearing policy store")
    
    if os.path.exists(POLICY_STORE_DIR):
        shutil.rmtree(POLICY_STORE_DIR)
        logger.info("Policy store directory removed")
    
    # Recreate empty directory
    os.makedirs(POLICY_STORE_DIR, exist_ok=True)
    logger.info("Policy store cleared successfully")
    
    return True

def policy_store_exists() -> bool:
    """
    Check if policy store exists and has data.
    
    Returns:
        True if policy store exists and is not empty
    """
    return os.path.exists(POLICY_STORE_DIR) and bool(os.listdir(POLICY_STORE_DIR))