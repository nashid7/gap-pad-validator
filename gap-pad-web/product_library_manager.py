#!/usr/bin/env python3
"""
Product Library Manager for Gap Pad Validator
This script allows you to manage product definitions externally and generate
the necessary JSON files for the web application.
"""

import json
import os
from typing import Dict, List, Any
from dataclasses import dataclass, asdict

@dataclass
class PadPosition:
    """Represents a thermal pad position on a PCB"""
    x: float  # Relative X position (0-1)
    y: float  # Relative Y position (0-1)
    width: float  # Relative width (0-1)
    height: float  # Relative height (0-1)
    required: bool  # Whether this pad is required
    name: str  # Pad identifier (e.g., "CPU", "GPU")
    color: str = "#ff6600"  # Display color

@dataclass
class ProductVariant:
    """Represents a product variant with its pad layout"""
    name: str
    description: str
    expectedPads: int
    padLayout: List[PadPosition]
    isCustom: bool = False

@dataclass
class ProductType:
    """Represents a product type (e.g., 3U, 6U)"""
    width: int  # Width in mm
    height: int  # Height in mm
    variants: Dict[str, ProductVariant]

class ProductLibraryManager:
    """Manages the product library for the Gap Pad Validator"""
    
    def __init__(self):
        self.library = {}
        self.default_products = self._create_default_products()
    
    def _create_default_products(self) -> Dict[str, ProductType]:
        """Create default product definitions with actual measurements"""
        
        # 3U Board Variants (Actual dimensions: 160mm x 100mm x 25.4mm)
        three_u_basic = ProductVariant(
            name="3U Basic",
            description="Standard 3U board with basic thermal management",
            expectedPads=4,
            padLayout=[
                PadPosition(0.2, 0.2, 0.15, 0.15, True, "CPU"),
                PadPosition(0.8, 0.2, 0.15, 0.15, True, "GPU"),
                PadPosition(0.2, 0.8, 0.15, 0.15, True, "VRM"),
                PadPosition(0.8, 0.8, 0.15, 0.15, True, "Chipset")
            ]
        )
        
        three_u_high_power = ProductVariant(
            name="3U High Power",
            description="3U board with enhanced thermal management",
            expectedPads=6,
            padLayout=[
                PadPosition(0.15, 0.15, 0.12, 0.12, True, "CPU"),
                PadPosition(0.85, 0.15, 0.12, 0.12, True, "GPU"),
                PadPosition(0.15, 0.85, 0.12, 0.12, True, "VRM1"),
                PadPosition(0.85, 0.85, 0.12, 0.12, True, "VRM2"),
                PadPosition(0.5, 0.5, 0.12, 0.12, True, "Chipset"),
                PadPosition(0.5, 0.8, 0.12, 0.12, False, "Optional", "#ffff00")
            ]
        )
        
        three_u = ProductType(
            width=160,  # Actual measurement
            height=100, # Actual measurement
            variants={
                "3U-Basic": three_u_basic,
                "3U-HighPower": three_u_high_power
            }
        )
        
        # 6U Board Variants (Actual dimensions: 160mm x 233mm x 25.4mm)
        six_u_standard = ProductVariant(
            name="6U Standard",
            description="Standard 6U board",
            expectedPads=8,
            padLayout=[
                PadPosition(0.1, 0.1, 0.1, 0.1, True, "CPU1"),
                PadPosition(0.9, 0.1, 0.1, 0.1, True, "CPU2"),
                PadPosition(0.1, 0.9, 0.1, 0.1, True, "GPU1"),
                PadPosition(0.9, 0.9, 0.1, 0.1, True, "GPU2"),
                PadPosition(0.3, 0.3, 0.1, 0.1, True, "VRM1"),
                PadPosition(0.7, 0.3, 0.1, 0.1, True, "VRM2"),
                PadPosition(0.3, 0.7, 0.1, 0.1, True, "Chipset1"),
                PadPosition(0.7, 0.7, 0.1, 0.1, True, "Chipset2")
            ]
        )
        
        six_u = ProductType(
            width=160,  # Actual measurement
            height=233, # Actual measurement
            variants={
                "6U-Standard": six_u_standard
            }
        )

        # MXC/XMC Board Variants (Actual dimensions: 143.75mm x 74mm)
        mxc_standard = ProductVariant(
            name="MXC Standard",
            description="Standard MXC/XMC board",
            expectedPads=4,
            padLayout=[
                PadPosition(0.2, 0.2, 0.15, 0.15, True, "CPU"),
                PadPosition(0.8, 0.2, 0.15, 0.15, True, "GPU"),
                PadPosition(0.2, 0.8, 0.15, 0.15, True, "VRM"),
                PadPosition(0.8, 0.8, 0.15, 0.15, True, "Chipset")
            ]
        )

        mxc_high_power = ProductVariant(
            name="MXC High Power",
            description="MXC/XMC board with enhanced thermal management",
            expectedPads=6,
            padLayout=[
                PadPosition(0.15, 0.15, 0.12, 0.12, True, "CPU"),
                PadPosition(0.85, 0.15, 0.12, 0.12, True, "GPU"),
                PadPosition(0.15, 0.85, 0.12, 0.12, True, "VRM1"),
                PadPosition(0.85, 0.85, 0.12, 0.12, True, "VRM2"),
                PadPosition(0.5, 0.5, 0.12, 0.12, True, "Chipset"),
                PadPosition(0.5, 0.8, 0.12, 0.12, False, "Optional", "#ffff00")
            ]
        )

        mxc_xmc = ProductType(
            width=143.75,  # Actual measurement
            height=74,     # Actual measurement
            variants={
                "MXC-Standard": mxc_standard,
                "MXC-HighPower": mxc_high_power
            }
        )
        
        return {
            "3U": three_u,
            "6U": six_u,
            "MXC/XMC": mxc_xmc
        }
    
    def add_custom_product(self, product_type: str, variant_name: str, 
                          width: int, height: int, pad_layout: List[Dict[str, Any]]) -> bool:
        """Add a custom product to the library"""
        try:
            # Convert pad layout to PadPosition objects
            pad_positions = []
            for pad_data in pad_layout:
                pad = PadPosition(
                    x=pad_data.get('x', 0.5),
                    y=pad_data.get('y', 0.5),
                    width=pad_data.get('width', 0.1),
                    height=pad_data.get('height', 0.1),
                    required=pad_data.get('required', True),
                    name=pad_data.get('name', f'Pad{len(pad_positions)+1}'),
                    color=pad_data.get('color', '#ff6600')
                )
                pad_positions.append(pad)
            
            variant = ProductVariant(
                name=variant_name,
                description=f"Custom {product_type} board",
                expectedPads=len(pad_positions),
                padLayout=pad_positions,
                isCustom=True
            )
            
            if product_type not in self.library:
                self.library[product_type] = ProductType(
                    width=width,
                    height=height,
                    variants={}
                )
            
            self.library[product_type].variants[variant_name] = variant
            print(f"Added custom product: {product_type} - {variant_name}")
            return True
            
        except Exception as e:
            print(f"Error adding custom product: {e}")
            return False
    
    def create_from_cad_data(self, cad_file_path: str) -> bool:
        """Create product definitions from CAD data (placeholder for future implementation)"""
        # This would integrate with CAD software to extract pad positions
        # For now, it's a placeholder
        print("CAD integration not yet implemented")
        return False
    
    def create_from_image_analysis(self, image_path: str, board_type: str, variant_name: str) -> bool:
        """Create product definitions from image analysis (placeholder)"""
        # This would use computer vision to detect pad positions
        # For now, it's a placeholder
        print("Image analysis integration not yet implemented")
        return False
    
    def export_to_json(self, output_path: str = "product_library.json") -> bool:
        """Export the library to a JSON file"""
        try:
            # Convert dataclasses to dictionaries
            export_data = {}
            for product_type, product in self.library.items():
                export_data[product_type] = {
                    "width": product.width,
                    "height": product.height,
                    "variants": {}
                }
                
                for variant_name, variant in product.variants.items():
                    export_data[product_type]["variants"][variant_name] = {
                        "name": variant.name,
                        "description": variant.description,
                        "expectedPads": variant.expectedPads,
                        "padLayout": [asdict(pad) for pad in variant.padLayout],
                        "isCustom": variant.isCustom
                    }
            
            with open(output_path, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            print(f"Library exported to {output_path}")
            return True
            
        except Exception as e:
            print(f"Error exporting library: {e}")
            return False
    
    def export_for_web_app(self, output_path: str = "src/productLibrary.js") -> bool:
        """Export the library in a format suitable for the web application"""
        try:
            # Convert to JavaScript format
            js_content = "// Auto-generated Product Library\n"
            js_content += "// Generated by Python Product Library Manager\n\n"
            js_content += "export const PRODUCT_LIBRARY = "
            js_content += json.dumps(self.library, indent=2, default=lambda x: asdict(x) if hasattr(x, '__dict__') else x)
            js_content += ";\n\n"
            js_content += "export default PRODUCT_LIBRARY;\n"
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w') as f:
                f.write(js_content)
            
            print(f"Web app library exported to {output_path}")
            return True
            
        except Exception as e:
            print(f"Error exporting for web app: {e}")
            return False
    
    def load_from_json(self, file_path: str) -> bool:
        """Load library from a JSON file"""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Convert back to dataclass objects
            for product_type, product_data in data.items():
                variants = {}
                for variant_name, variant_data in product_data['variants'].items():
                    pad_layout = []
                    for pad_data in variant_data['padLayout']:
                        pad = PadPosition(
                            x=pad_data['x'],
                            y=pad_data['y'],
                            width=pad_data['width'],
                            height=pad_data['height'],
                            required=pad_data['required'],
                            name=pad_data['name'],
                            color=pad_data.get('color', '#ff6600')
                        )
                        pad_layout.append(pad)
                    
                    variant = ProductVariant(
                        name=variant_data['name'],
                        description=variant_data['description'],
                        expectedPads=variant_data['expectedPads'],
                        padLayout=pad_layout,
                        isCustom=variant_data.get('isCustom', False)
                    )
                    variants[variant_name] = variant
                
                product = ProductType(
                    width=product_data['width'],
                    height=product_data['height'],
                    variants=variants
                )
                self.library[product_type] = product
            
            print(f"Library loaded from {file_path}")
            return True
            
        except Exception as e:
            print(f"Error loading library: {e}")
            return False
    
    def list_products(self) -> None:
        """List all products in the library"""
        print("\n=== Product Library ===")
        for product_type, product in self.library.items():
            print(f"\n{product_type} ({product.width}mm × {product.height}mm):")
            for variant_name, variant in product.variants.items():
                print(f"  - {variant_name}: {variant.name}")
                print(f"    Description: {variant.description}")
                print(f"    Expected Pads: {variant.expectedPads}")
                print(f"    Custom: {variant.isCustom}")
                print(f"    Pad Layout:")
                for pad in variant.padLayout:
                    status = "Required" if pad.required else "Optional"
                    print(f"      * {pad.name}: ({pad.x:.2f}, {pad.y:.2f}) {pad.width:.2f}×{pad.height:.2f} [{status}]")

def main():
    """Main function to demonstrate the library manager"""
    manager = ProductLibraryManager()
    
    # Load default products
    manager.library = manager.default_products
    
    print("=== Gap Pad Validator - Product Library Manager ===")
    print("This tool helps manage product definitions for the web application.\n")
    
    while True:
        print("\nOptions:")
        print("1. List all products")
        print("2. Add custom product")
        print("3. Export to JSON")
        print("4. Export for web app")
        print("5. Load from JSON")
        print("6. Exit")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == "1":
            manager.list_products()
            
        elif choice == "2":
            print("\n=== Add Custom Product ===")
            product_type = input("Product type (e.g., 3U, 6U, Custom): ").strip()
            variant_name = input("Variant name: ").strip()
            width = int(input("Board width (mm): "))
            height = int(input("Board height (mm): "))
            
            print("\nEnter pad positions (x, y, width, height, required, name)")
            print("Enter 'done' when finished")
            
            pad_layout = []
            while True:
                pad_input = input(f"Pad {len(pad_layout)+1} (x,y,width,height,required,name): ").strip()
                if pad_input.lower() == 'done':
                    break
                
                try:
                    parts = pad_input.split(',')
                    if len(parts) >= 6:
                        pad_data = {
                            'x': float(parts[0]),
                            'y': float(parts[1]),
                            'width': float(parts[2]),
                            'height': float(parts[3]),
                            'required': parts[4].lower() in ['true', 'yes', '1', 'required'],
                            'name': parts[5].strip()
                        }
                        pad_layout.append(pad_data)
                    else:
                        print("Invalid format. Use: x,y,width,height,required,name")
                except ValueError:
                    print("Invalid number format")
            
            if manager.add_custom_product(product_type, variant_name, width, height, pad_layout):
                print("Custom product added successfully!")
            
        elif choice == "3":
            output_path = input("Output JSON file path (default: product_library.json): ").strip()
            if not output_path:
                output_path = "product_library.json"
            manager.export_to_json(output_path)
            
        elif choice == "4":
            output_path = input("Output JS file path (default: src/productLibrary.js): ").strip()
            if not output_path:
                output_path = "src/productLibrary.js"
            manager.export_for_web_app(output_path)
            
        elif choice == "5":
            file_path = input("JSON file path to load: ").strip()
            manager.load_from_json(file_path)
            
        elif choice == "6":
            print("Goodbye!")
            break
            
        else:
            print("Invalid choice. Please enter 1-6.")

if __name__ == "__main__":
    main()
