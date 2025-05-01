import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class VerificationPage extends StatefulWidget {
  final String email;
  final String password;

  const VerificationPage({
    Key? key,
    required this.email,
    required this.password,
  }) : super(key: key);

  @override
  _VerificationPageState createState() => _VerificationPageState();
}

class _VerificationPageState extends State<VerificationPage> {
  final List<TextEditingController> _controllers = List.generate(
    6,
    (index) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(
    6,
    (index) => FocusNode(),
  );
  bool _isLoading = false;

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onChanged(int index, String value) {
    if (value.length == 1 && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
  }

  void _onBackspace(int index) {
    if (index > 0 && _controllers[index].text.isEmpty) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  String _getVerificationCode() {
    return _controllers.map((c) => c.text).join();
  }

  Future<void> _verifyCode() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final code = _getVerificationCode();
      print('Verifying code for email: ${widget.email}');
      print('Verification code entered: $code');

      // First, check if the user exists
      final checkUserResponse = await http.get(
        Uri.parse('http://localhost:8080/api/users/schoolusers/${widget.email}'),
      );

      print('Check user response status: ${checkUserResponse.statusCode}');
      print('Check user response body: ${checkUserResponse.body}');

      if (checkUserResponse.statusCode == 200) {
        // User exists, proceed with verification
        final response = await http.post(
          Uri.parse('http://localhost:8080/api/auth/verify'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
                 'email': widget.email,
                 'code': code, // <-- WRONG
                 'password': widget.password,
                }),
        );

        print('Verification response status: ${response.statusCode}');
        print('Verification response body: ${response.body}');

        if (response.statusCode == 200) {
          if (!mounted) return;
          print('Verification successful, navigating to home');
          Navigator.pushReplacementNamed(context, '/home');
        } else {
          throw Exception('Invalid verification code: ${response.body}');
        }
      } else {
        throw Exception('User not found. Please register first.');
      }
    } catch (e) {
      print('Error during verification: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _resendCode() async {
    setState(() {
      _isLoading = true;
    });

    try {
      print('Resending code to: ${widget.email}');
      
      // First, check if the user exists
      final checkUserResponse = await http.get(
        Uri.parse('http://localhost:8080/api/users/schoolusers/${widget.email}'),
      );

      print('Check user response status: ${checkUserResponse.statusCode}');
      print('Check user response body: ${checkUserResponse.body}');

      if (checkUserResponse.statusCode == 200) {
        // User exists, proceed with resending code
        final response = await http.post(
          Uri.parse('http://localhost:8080/api/auth/resend-code'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': widget.email,
          }),
        );

        print('Resend code response status: ${response.statusCode}');
        print('Resend code response body: ${response.body}');

        if (response.statusCode == 200) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Verification code resent successfully'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          throw Exception('Failed to resend verification code: ${response.body}');
        }
      } else {
        throw Exception('User not found. Please register first.');
      }
    } catch (e) {
      print('Error during resend: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verification'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Enter the verification code sent to ${widget.email}',
              style: const TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(
                6,
                (index) => SizedBox(
                  width: 40,
                  child: TextField(
                    controller: _controllers[index],
                    focusNode: _focusNodes[index],
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.number,
                    maxLength: 1,
                    decoration: const InputDecoration(
                      counterText: '',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) => _onChanged(index, value),
                    onSubmitted: (_) {
                      if (index < 5) {
                        _focusNodes[index + 1].requestFocus();
                      }
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isLoading ? null : _verifyCode,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Verify'),
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: _isLoading ? null : _resendCode,
              child: const Text('Resend Code'),
            ),
          ],
        ),
      ),
    );
  }
} 