import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:social_media_app/core/Api.dart';

class AuthService {
  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('${Api.baseUrl}/auth/login');
    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'x-client-type': 'mobile',
        },
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception(jsonDecode(response.body)['message'] ?? 'Login failed');
      }
    } catch (e) {
      throw Exception('Failed to connect to server: $e');
    }
  }

  Future<Map<String, dynamic>> register({
    required String email,
  }) async {
    try {
      print('avant api');
      final response = await http.post(
        Uri.parse('${Api.baseUrl}/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      if (response.statusCode == 200) {
        print('Status code: ${response.statusCode}');
        print('Response body: ${response.body}');
        return json.decode(response.body);
      } else {
        throw Exception(
            jsonDecode(response.body)['message'] ?? 'Registration failed');
      }
    } catch (e) {
      throw Exception('Failed to connect to server: $e');
    }
  }

  Future<bool> verifyEmail(String email, String code) async {
    try {
      final response = await http.post(
        Uri.parse('${Api.baseUrl}/auth/verify-email'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'code': code,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      throw Exception('Failed to verify email: $e');
    }
  }

  Future<bool> createAccount({
    required String email,
    required String password,
    required String code,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${Api.baseUrl}/auth/create-account'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'code': code,
        }),
      );

      return response.statusCode == 201;
    } catch (e) {
      throw Exception('Failed to create account: $e');
    }
  }
}
