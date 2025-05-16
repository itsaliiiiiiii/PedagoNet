import 'package:flutter/material.dart';
import 'package:social_media_app/screens/EntryPage.dart';
import 'package:social_media_app/screens/auth/LoginPage2.dart';
import 'screens/HomePage.dart';

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
      routes: {
        '/': (context) => EntryPage(),
      },
    );
  }
}
