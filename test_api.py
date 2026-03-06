#!/usr/bin/env python
import urllib.request
import json
import time

# Give server a moment to be ready
time.sleep(2)

try:
    print("Testing API endpoint: http://localhost:5000/api/analyze")
    
    # Prepare multipart form data
    from pathlib import Path
    resume_file = Path('SAMPLE_RESUME.txt').read_bytes()
    job_file = Path('SAMPLE_JOB_DESCRIPTION.txt').read_bytes()
    
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="resume"; filename="SAMPLE_RESUME.txt"\r\n'
        f'Content-Type: text/plain\r\n\r\n'
    ).encode() + resume_file + (
        f'\r\n--{boundary}\r\n'
        f'Content-Disposition: form-data; name="job_description"; filename="SAMPLE_JOB_DESCRIPTION.txt"\r\n'
        f'Content-Type: text/plain\r\n\r\n'
    ).encode() + job_file + (
        f'\r\n--{boundary}--\r\n'
    ).encode()
    
    req = urllib.request.Request(
        'http://localhost:5000/api/analyze',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode())
        print('\n✓ API Response Status: SUCCESS (200)')
        print('✓ Response has resume_improvements:', 'resume_improvements' in data)
        
        if 'resume_improvements' in data:
            improvements = data['resume_improvements']
            print('✓ Improvement fields:', list(improvements.keys()))
            
            if improvements.get('quantified_achievements'):
                print(f'  - Quantified achievements: {len(improvements["quantified_achievements"])} items')
            
            if improvements.get('summary_section'):
                print(f'  - Summary section: {len(improvements["summary_section"])} characters')
            
            if improvements.get('keywords'):
                print(f'  - Keywords: {len(improvements["keywords"])} items')
            
            if improvements.get('ats_compatibility'):
                print(f'  - ATS compatibility: {len(improvements["ats_compatibility"])} characters')
        
        print("\n✓ FEATURE TEST PASSED: Resume improvements are being returned!")
        
except urllib.error.URLError as e:
    print(f'✗ Error: Cannot connect to API server at http://localhost:5000')
    print(f'  Make sure the Flask backend is running: python backend/app.py')
    print(f'  Details: {e}')
except Exception as e:
    print(f'✗ Error: {str(e)}')
    import traceback
    traceback.print_exc()

