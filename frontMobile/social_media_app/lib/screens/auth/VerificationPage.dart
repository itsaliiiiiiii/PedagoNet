import 'package:flutter/material.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:social_media_app/screens/auth/CreatePasswordPage.dart';
import 'package:social_media_app/services/auth_service.dart';
import 'package:social_media_app/screens/auth/LoginPage2.dart';

class VerificationPage extends StatefulWidget {
  final String email;

  const VerificationPage({Key? key, required this.email}) : super(key: key);

  @override
  _VerificationPageState createState() => _VerificationPageState();
}

class _VerificationPageState extends State<VerificationPage> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _verifyEmail() async {
    if (!_formKey.currentState!.validate()) return;

    if (!mounted) return; // Ajouté ici pour sécuriser

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // On vérifie encore avant d'accéder au contrôleur
      if (!mounted) return;
      final code = _codeController.text;

      final success = await _authService.verifyEmail(
        widget.email,
        code,
      );

      if (!mounted) return;

      if (success) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => PasswordPage(
              code:code,
              mail:widget.email
            ),
          ),
        );
        // ScaffoldMessenger.of(context).showSnackBar(
        //   const SnackBar(content: Text('Email verified successfully!')),
        // );
        // Navigator.pushReplacement(
        //   context,
        //   MaterialPageRoute(builder: (context) => const LoginPage()),
        // );
      } else {
        setState(() {
          _errorMessage = 'Invalid verification code';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
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
        title: const Text('Verify Email'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Enter Verification Code',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'We sent a verification code to ${widget.email}',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                PinCodeTextField(
                  appContext: context,
                  length: 6,
                  keyboardType: TextInputType.number,
                  controller: _codeController,
                  animationType: AnimationType.fade,
                  pinTheme: PinTheme(
                    shape: PinCodeFieldShape.box,
                    borderRadius: BorderRadius.circular(5),
                    fieldHeight: 50,
                    fieldWidth: 40,
                    activeFillColor: Colors.white,
                    selectedFillColor: Colors.white,
                    inactiveFillColor: Colors.white,
                    activeColor: Colors.blue,
                    selectedColor: Colors.blueAccent,
                    inactiveColor: Colors.grey,
                  ),
                  animationDuration: const Duration(milliseconds: 300),
                  enableActiveFill: true,
                  onChanged: (value) {},
                  validator: (value) {
                    if (value == null || value.length != 6) {
                      return 'Please enter the 6-digit verification code';
                    }
                    return null;
                  },
                ),
                if (_errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isLoading
                        ? null
                        : () {
                            _verifyEmail();
                          },
                    child: _isLoading
                        ? const CircularProgressIndicator()
                        : const Text('Verify'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // @override
  // void dispose() {
  //   // _codeController.dispose();
  //   // super.dispose();
  // }
}
