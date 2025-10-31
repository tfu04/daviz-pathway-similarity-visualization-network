"""
CSV to JSON converter for disease-disease network data.
Parses pathway_network_result_with_gpt4o_evaluation.csv and generates
a network JSON structure with nodes and edges.
"""

import pandas as pd
import json
import numpy as np
from typing import Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NetworkDataProcessor:
    """Process CSV data into network JSON format."""
    
    def __init__(self, csv_path: str):
        """
        Initialize processor with CSV file path.
        
        Args:
            csv_path: Path to the CSV file containing network data
        """
        self.csv_path = csv_path
        self.df = None
        self.nodes = {}
        self.edges = []
    
    def load_data(self) -> pd.DataFrame:
        """Load CSV data into DataFrame."""
        logger.info(f"Loading data from {self.csv_path}")
        self.df = pd.read_csv(self.csv_path, encoding='utf-8')
        logger.info(f"Loaded {len(self.df)} rows")
        return self.df
    
    def extract_disease_name(self, pair_string: str) -> str:
        """
        Extract clean disease name from pair string.
        Example: "Anxiety_disorder--None" -> "Anxiety disorder"
        
        Args:
            pair_string: Raw pair string from CSV
            
        Returns:
            Clean disease name
        """
        # Remove condition after "--"
        disease = pair_string.split('--')[0]
        # Replace underscores with spaces
        disease = disease.replace('_', ' ')
        return disease
    
    def create_edge_id(self, pair1: str, pair2: str) -> str:
        """
        Create unique edge ID from two pair strings.
        Uses alphabetical ordering to ensure uniqueness.
        
        Args:
            pair1: First disease pair
            pair2: Second disease pair
            
        Returns:
            Unique edge ID
        """
        # Sort to ensure consistency
        sorted_pairs = sorted([pair1, pair2])
        return f"{sorted_pairs[0]}__{sorted_pairs[1]}"
    
    def parse_list_field(self, field_value: Any) -> List[str]:
        """
        Parse semicolon-separated string into list.
        
        Args:
            field_value: Field value (string or NaN)
            
        Returns:
            List of strings
        """
        if pd.isna(field_value) or field_value == '' or field_value == 'nan':
            return []
        
        # Split by semicolon and clean
        items = str(field_value).split(';')
        return [item.strip() for item in items if item.strip()]
    
    def process_data(self) -> Dict[str, Any]:
        """
        Process DataFrame into network JSON structure.
        
        Returns:
            Dictionary with 'nodes' and 'edges' keys
        """
        if self.df is None:
            self.load_data()
        
        logger.info("Processing nodes and edges...")
        
        # Track unique nodes
        nodes_set = set()
        edges_list = []
        
        for idx, row in self.df.iterrows():
            pair1 = row['pair1']
            pair2 = row['pair2']
            
            # Add nodes
            nodes_set.add(pair1)
            nodes_set.add(pair2)
            
            # Parse fields
            shared_genes = self.parse_list_field(row.get('shared_genes', ''))
            filtered_pathways = self.parse_list_field(row.get('filtered_pathways', ''))
            
            # Create edge
            edge = {
                'id': self.create_edge_id(pair1, pair2),
                'source': pair1,
                'target': pair2,
                'weight': float(row.get('weight', 0)),
                'shared_genes': shared_genes,
                'filtered_pathways': filtered_pathways,
                'interpretable': str(row.get('interpretability_gpt4o', 'NO')),
                'reason_gpt4o': str(row.get('reason_gpt4o', ''))
            }
            
            edges_list.append(edge)
        
        # Create nodes list
        nodes_list = []
        for node_id in sorted(nodes_set):
            disease_label = self.extract_disease_name(node_id)
            nodes_list.append({
                'id': node_id,
                'label': disease_label
            })
        
        logger.info(f"Created {len(nodes_list)} nodes and {len(edges_list)} edges")
        
        return {
            'nodes': [{'data': node} for node in nodes_list],
            'edges': [{'data': edge} for edge in edges_list]
        }
    
    def save_json(self, output_path: str, network_data: Dict[str, Any]) -> None:
        """
        Save network data to JSON file.
        
        Args:
            output_path: Path to save JSON file
            network_data: Network data dictionary
        """
        logger.info(f"Saving network data to {output_path}")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(network_data, f, indent=2, ensure_ascii=False)
        logger.info("Data saved successfully")
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about the network.
        
        Returns:
            Dictionary with statistics
        """
        if self.df is None:
            self.load_data()
        
        stats = {
            'total_edges': len(self.df),
            'weight_min': float(self.df['weight'].min()),
            'weight_max': float(self.df['weight'].max()),
            'weight_mean': float(self.df['weight'].mean()),
            'weight_median': float(self.df['weight'].median()),
            'weight_q25': float(self.df['weight'].quantile(0.25)),
            'weight_q75': float(self.df['weight'].quantile(0.75)),
            'interpretability_yes_count': len(self.df[self.df['interpretability_gpt4o'] == 'YES']),
            'interpretability_no_count': len(self.df[self.df['interpretability_gpt4o'] == 'NO'])
        }
        
        return stats


def main():
    """Main execution function."""
    # Paths - CSV is in parent directory, output in backend/data
    csv_path = '../pathway_network_result_with_gpt4o_evaluation.csv'
    output_path = 'data/processed_network.json'
    
    # Process data
    processor = NetworkDataProcessor(csv_path)
    network_data = processor.process_data()
    processor.save_json(output_path, network_data)
    
    # Print statistics
    stats = processor.get_statistics()
    print("\n=== Network Statistics ===")
    for key, value in stats.items():
        print(f"{key}: {value}")
    
    print(f"\n=== Sample Output ===")
    print(f"Total nodes: {len(network_data['nodes'])}")
    print(f"Total edges: {len(network_data['edges'])}")
    print(f"\nFirst node example:")
    print(json.dumps(network_data['nodes'][0], indent=2))
    print(f"\nFirst edge example:")
    print(json.dumps(network_data['edges'][0], indent=2))


if __name__ == '__main__':
    main()
