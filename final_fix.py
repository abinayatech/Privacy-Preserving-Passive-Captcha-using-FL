import re
import sys

def remove_floating_code(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find and remove any code that's not in a function
    # Look for indented lines that aren't inside def or class
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if this looks like code (indented, not empty, not comment-only)
        if (line.strip() and 
            line.startswith(' ') and 
            not line.strip().startswith('#') and
            not line.strip().startswith('"""')):
            
            # Check if we're inside a function
            inside_function = False
            for j in range(i-1, max(0, i-50), -1):
                if lines[j].strip().startswith('def ') or lines[j].strip().startswith('class '):
                    inside_function = True
                    break
                elif lines[j].strip() and not lines[j].startswith(' '):
                    # Reached beginning of scope
                    break
            
            if not inside_function:
                print(f"Removing floating code at line {i+1}: {line.strip()[:50]}...")
                del lines[i]
                continue  # Don't increment i since we deleted
        
        i += 1
    
    # Write back
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print("✅ Cleaned floating code")

if __name__ == '__main__':
    remove_floating_code('flask_server.py')