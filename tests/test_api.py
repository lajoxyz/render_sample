import unittest

from fastapi.testclient import TestClient
from main import app


class APITest(unittest.TestCase):
    def test_hello(self):
        response = TestClient(app).get('/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Hello, world!'})

    def test_health(self):
        response = TestClient(app).get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})
