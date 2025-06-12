import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:social_media_app/provider/PostProvider.dart';
import 'package:social_media_app/screens/EntryPage.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => PostProvider()),
      ],
      child: MyApp(),
    ),
  );
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
