"""
Test script to verify the backend API is working correctly.
Run this after starting the server.
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}\n")
        return False

def test_stats():
    """Test statistics endpoint."""
    print("Testing /stats endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}\n")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}\n")
        return False

def test_network_filtered():
    """Test network endpoint with filters."""
    print("Testing /network endpoint with filters...")
    try:
        params = {
            "min_weight": 30000,
            "limit": 5
        }
        response = requests.get(f"{BASE_URL}/network", params=params)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Returned {len(data['edges'])} edges and {len(data['nodes'])} nodes")
        print(f"First edge: {json.dumps(data['edges'][0] if data['edges'] else {}, indent=2)}\n")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}\n")
        return False

def test_search():
    """Test search endpoint."""
    print("Testing /search endpoint...")
    try:
        params = {"keyword": "cancer"}
        response = requests.get(f"{BASE_URL}/search", params=params)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Found {data['count']} results for 'cancer'")
        if data['results']:
            print(f"First result: {json.dumps(data['results'][0], indent=2)}\n")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}\n")
        return False

def test_disease_detail():
    """Test disease detail endpoint."""
    print("Testing /disease/{id} endpoint...")
    try:
        disease_id = "Bipolar_disorder--None"
        response = requests.get(f"{BASE_URL}/disease/{disease_id}")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Found {data['connected_diseases_count']} connected diseases")
        print(f"Total edges: {data['metadata']['total_edges']}")
        print(f"Average weight: {data['metadata']['avg_weight']:.2f}\n")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}\n")
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("Disease Network API Test Suite")
    print("=" * 60)
    print(f"Testing API at: {BASE_URL}\n")
    
    tests = [
        ("Health Check", test_health),
        ("Statistics", test_stats),
        ("Network with Filters", test_network_filtered),
        ("Search", test_search),
        ("Disease Detail", test_disease_detail)
    ]
    
    results = []
    for name, test_func in tests:
        success = test_func()
        results.append((name, success))
    
    print("=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    for name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{status}: {name}")
    
    passed = sum(1 for _, s in results if s)
    total = len(results)
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All tests passed!")
        sys.exit(0)
    else:
        print("\n✗ Some tests failed. Check the output above.")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user.")
        sys.exit(1)
