#!/usr/bin/env python3
"""
This module provides a simple helper function for pagination.
"""

from typing import Tuple

def index_range(page: int, page_size: int) -> Tuple[int, int]:
    """
    Returns a tuple of size two containing a start index and an end index
    corresponding to the range of indexes to return in a list for those
    particular pagination parameters.
    
    Args:
    page (int): page number (1-indexed)
    page_size (int): number of items per page

    Returns:
    Tuple[int, int]: start index and end index
    """
    start = (page - 1) * page_size
    end = start + page_size
    return start, end

