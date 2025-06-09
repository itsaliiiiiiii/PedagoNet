import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:http/http.dart' as http;

class CreateClassroomPage extends StatefulWidget {
  final String token;

  CreateClassroomPage({required this.token, Key? key}) : super(key: key);

  @override
  _CreateClassroomPageState createState() => _CreateClassroomPageState();
}

class _CreateClassroomPageState extends State<CreateClassroomPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _codeController = TextEditingController();

  bool _isLoading = false;
  bool _autoGenerateCode = true;

  @override
  void initState() {
    super.initState();
    _generateClassroomCode();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  void _generateClassroomCode() {
    const String chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    Random random = Random();
    String code = '';

    for (int i = 0; i < 6; i++) {
      code += chars[random.nextInt(chars.length)];
    }

    setState(() {
      _codeController.text = code;
    });
  }

  Future<void> _createClassroom() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    // Simuler un appel API

    String api = "${Api.baseUrl}/classrooms";

    final response = await http.post(Uri.parse(api),
        body: jsonEncode({
          "name": _nameController.text,
          "description": _descriptionController.text,
          "code": _codeController.text
        }),
        headers: {
          'Authorization': "Bearer ${widget.token}",
          'Content-Type': 'application/json',
        });

    setState(() {
      _isLoading = false;
    });

    if (response.statusCode == 200 || response.statusCode == 201) {
      print(response.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white),
              const SizedBox(width: 8),
              Text('Cours  créé avec succès!'),
            ],
          ),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.pop(context);
    }
    // Afficher un message de succès

    // Retourner les données à la page précédente
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Créer un cours',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.indigo,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // En-tête avec icône
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.1),
                        spreadRadius: 1,
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.indigo.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(50),
                        ),
                        child: Icon(
                          Icons.school,
                          size: 48,
                          color: Colors.indigo,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Nouveau cours',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Remplissez les informations ci-dessous pour créer votre cours',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Formulaire
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.1),
                        spreadRadius: 1,
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Champ nom du cours
                      _buildSectionTitle('Nom du cours'),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _nameController,
                        decoration: InputDecoration(
                          hintText: 'Ex: Mathématiques 3ème',
                          prefixIcon:
                              const Icon(Icons.book, color: Colors.indigo),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                                color: Colors.indigo, width: 2),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Le nom du cours est obligatoire';
                          }
                          if (value.trim().length < 3) {
                            return 'Le nom doit contenir au moins 3 caractères';
                          }
                          return null;
                        },
                        textCapitalization: TextCapitalization.words,
                      ),

                      const SizedBox(height: 24),

                      // Champ description
                      _buildSectionTitle('Description'),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _descriptionController,
                        maxLines: 4,
                        decoration: InputDecoration(
                          hintText:
                              'Décrivez votre cours, les objectifs, le programme...',
                          prefixIcon: const Padding(
                            padding: EdgeInsets.only(bottom: 60),
                            child:
                                Icon(Icons.description, color: Colors.indigo),
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                                color: Colors.indigo, width: 2),
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'La description est obligatoire';
                          }
                          if (value.trim().length < 10) {
                            return 'La description doit contenir au moins 10 caractères';
                          }
                          return null;
                        },
                        textCapitalization: TextCapitalization.sentences,
                      ),

                      const SizedBox(height: 24),

                      // Champ code du cours
                      _buildSectionTitle('Code du cours'),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _codeController,
                              decoration: InputDecoration(
                                hintText: 'Code unique du cours',
                                prefixIcon: const Icon(Icons.qr_code,
                                    color: Colors.indigo),
                                suffixIcon: IconButton(
                                  icon: const Icon(Icons.content_copy,
                                      color: Colors.grey),
                                  onPressed: () {
                                    Clipboard.setData(ClipboardData(
                                        text: _codeController.text));
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                            'Code copié dans le presse-papiers'),
                                        duration: Duration(seconds: 2),
                                      ),
                                    );
                                  },
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide:
                                      BorderSide(color: Colors.grey[300]!),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                      color: Colors.indigo, width: 2),
                                ),
                                filled: true,
                                fillColor: Colors.grey[50],
                              ),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Le code du cours est obligatoire';
                                }
                                if (value.trim().length < 4) {
                                  return 'Le code doit contenir au moins 4 caractères';
                                }
                                return null;
                              },
                              textCapitalization: TextCapitalization.characters,
                              inputFormatters: [
                                FilteringTextInputFormatter.allow(
                                    RegExp(r'[A-Z0-9]')),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton.icon(
                            onPressed: _generateClassroomCode,
                            icon: const Icon(Icons.refresh, size: 20),
                            label: const Text('Générer'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orange,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Informations sur le code
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue[200]!),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.info_outline,
                                color: Colors.blue[600], size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Les étudiants utiliseront ce code pour rejoindre votre cours',
                                style: TextStyle(
                                  color: Colors.blue[700],
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Boutons d'action
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _isLoading
                            ? null
                            : () {
                                Navigator.of(context).pop();
                              },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          side: BorderSide(color: Colors.grey[400]!),
                        ),
                        child: const Text(
                          'Annuler',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _createClassroom,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.indigo,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white),
                                ),
                              )
                            : const Text(
                                'Créer le cours',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: Colors.grey[800],
      ),
    );
  }
}

// Modèle de données pour le cours
class ClassroomData {
  final String name;
  final String description;
  final String code;
  final DateTime createdAt;

  ClassroomData({
    required this.name,
    required this.description,
    required this.code,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'code': code,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory ClassroomData.fromJson(Map<String, dynamic> json) {
    return ClassroomData(
      name: json['name'],
      description: json['description'],
      code: json['code'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
