#!/usr/bin/env python3
"""
Script to check available Groq models and update the app if needed
"""

from groq import Groq
import json
import sys
import os

def get_available_models(api_key):
    """Get list of available models from Groq"""
    try:
        client = Groq(api_key=api_key)
        models = client.models.list()
        
        print("Available Groq Models:")
        print("=" * 60)
        
        model_list = []
        for model in models.data:
            model_id = model.id
            model_list.append(model_id)
            print(f"✓ {model_id}")
        
        print("=" * 60)
        print(f"\nTotal models available: {len(model_list)}")
        
        # Recommend a good model
        print("\nRecommended models for Resume AI:")
        recommended = [
            "llama-3.1-8b-instant",
            "llama-3.2-1b-preview",
            "gemma-2-9b-it",
            "mixtral-8x7b-32768"
        ]
        
        print("\nTesting recommended models:")
        for model in recommended:
            if model in model_list:
                print(f"✓ {model} - AVAILABLE")
            else:
                print(f"✗ {model} - Not available")
        
        # Find the best available
        best_model = None
        for model in recommended:
            if model in model_list:
                best_model = model
                break
        
        if not best_model and model_list:
            best_model = model_list[0]
        
        if best_model:
            print(f"\n✨ Recommended to use: {best_model}")
            return best_model
        else:
            print("\n⚠️  No recommended models found!")
            return None
            
    except Exception as e:
        print(f"Error getting models: {e}")
        return None

def update_model_in_code(model_name):
    """Update the model name in analysis_service.py"""
    file_path = "./analysis_service.py"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        print("Make sure you're running this from the backend directory")
        return False
    
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Replace the model line
        import re
        pattern = r'self\.model = "[^"]*"'
        replacement = f'self.model = "{model_name}"'
        new_content = re.sub(pattern, replacement, content)
        
        if new_content != content:
            with open(file_path, 'w') as f:
                f.write(new_content)
            print(f"✓ Updated model to: {model_name}")
            return True
        else:
            print("❌ No model line found to update")
            return False
    except Exception as e:
        print(f"Error updating file: {e}")
        return False

if __name__ == "__main__":
    # Get API key from environment
    api_key = os.getenv('GROQ_API_KEY')
    
    if not api_key:
        print("❌ GROQ_API_KEY not found in environment")
        print("\nPlease set it first:")
        print("  Windows: $env:GROQ_API_KEY='your-key-here'")
        print("  Linux/Mac: export GROQ_API_KEY='your-key-here'")
        sys.exit(1)
    
    print("🔍 Checking available Groq models...\n")
    best_model = get_available_models(api_key)
    
    if best_model and len(sys.argv) > 1 and sys.argv[1] == "--update":
        print("\n📝 Updating analysis_service.py...")
        if update_model_in_code(best_model):
            print("✨ Done! Restart your backend server.")
