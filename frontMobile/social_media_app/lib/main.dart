import 'package:flutter/material.dart';
import 'screens/HomePage.dart';
import 'screens/LoginPage.dart';
import 'screens/RegisterPage.dart';
import 'screens/VerificationPage.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(primaryColor: const Color.fromARGB(255, 221, 218, 218)),
      debugShowCheckedModeBanner: false,
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginPage(),
        '/register': (context) => const RegisterPage(),
        '/verify': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, String>;
          return VerificationPage(
            email: args['email']!,
            password: args['password']!,
          );
        },
        '/home': (context) => const HomePage(),
      },
    );
  }
}
