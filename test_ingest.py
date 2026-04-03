import http.client
import json
import urllib.parse

def send_request(content_type, body_data):
    conn = http.client.HTTPConnection("localhost", 3000)
    
    headers = {
        'Content-Type': content_type
    }
    
    body = body_data
    
    if content_type == 'application/json':
        body = json.dumps(body_data)
    elif content_type == 'application/x-www-form-urlencoded':
        body = urllib.parse.urlencode(body_data)

    print(f"Sending {content_type}...")
    conn.request("POST", "/api/leads/ingest", body, headers)
    res = conn.getresponse()
    data = res.read()
    print(f"Status: {res.status}")
    print(f"Response: {data.decode('utf-8')}\n")

# Test JSON
send_request('application/json', {
    "apiKey": "test",
    "clienteId": "test",
    "nombre": "Test",
    "telefono": "123456"
})

# Test form urlencoded
send_request('application/x-www-form-urlencoded', {
    "apiKey": "test",
    "clienteId": "test",
    "nombre": "Test",
    "telefono": "123456"
})
