import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:social_media_app/core/Api.dart';
import 'dart:convert';

import 'package:social_media_app/screens/HomePage.dart';

class LoginPage extends StatelessWidget {
  // Méthode pour effectuer la requête
  Future<void> _login(BuildContext context) async {
    final url = Uri.parse(
        '${Api.baseUrl}/auth/login'); 
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'x-client-type': 'mobile',
      },
      body: json.encode({
        'email': 'test.student@test.com',
        'password': 'test123',
      }),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      final token = responseData['token'];

      if (token != null) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => HomePage(token: token),
          ),
        );
      }
    } else {
      print('❌ Échec du login : ${response.body}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Login Page")),
      body: Center(
        child: TextButton(
          onPressed: () {
            _login(context); // Passer le context à la méthode _login
          },
          child: Text("Login"),
        ),
      ),
    );
  }
}
