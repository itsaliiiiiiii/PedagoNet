import 'dart:io';
import 'package:flutter/material.dart';
// import 'package:image_picker/image_picker.dart';
// import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'package:social_media_app/core/Api.dart';

class CreatePostPage extends StatefulWidget {
  final String token;

  const CreatePostPage({super.key, required this.token});

  @override
  _CreatePostPageState createState() => _CreatePostPageState();
}

class _CreatePostPageState extends State<CreatePostPage> {
  final TextEditingController _postController = TextEditingController();
  final List<File> _selectedImages = [];
  final List<File> _selectedDocs = [];
  bool _isLoading = false;

  Future<void> _pickImage() async {
    // final ImagePicker picker = ImagePicker();
    // final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    
    // if (image != null) {
    //   setState(() {
    //     _selectedImages.add(File(image.path));
    //   });
    // }
  }

  Future<void> _pickDocument() async {
    //FilePickerResult? result = await FilePicker.platform.pickFiles();
    
    // if (result != null) {
    //   setState(() {
    //     _selectedDocs.add(File(result.files.single.path!));
    //   });
    // }
  }

  Future<void> _createPost() async {
    if (_postController.text.isEmpty && _selectedImages.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez ajouter du texte ou une image')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Créer un multipart request pour envoyer des fichiers
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${Api.baseUrl}/posts'),
      );

      // Ajouter le token d'authentification
      request.headers.addAll({
        'Authorization': 'Bearer ${widget.token}',
      });

      // Ajouter le texte du post
      request.fields['description'] = _postController.text;

      // Ajouter les images
      for (var i = 0; i < _selectedImages.length; i++) {
        var file = await http.MultipartFile.fromPath(
          'images',
          _selectedImages[i].path,
        );
        request.files.add(file);
      }

      // Ajouter les documents
      for (var i = 0; i < _selectedDocs.length; i++) {
        var file = await http.MultipartFile.fromPath(
          'documents',
          _selectedDocs[i].path,
        );
        request.files.add(file);
      }

      // Envoyer la requête
      var response = await request.send();
      
      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Publication créée avec succès')),
        );
        Navigator.pop(context, true); // Retourner true pour indiquer le succès
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de la création de la publication')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Créer une publication'),
        backgroundColor: Colors.white,
        //foregroundColor: Colors.white,
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _createPost,
            child: _isLoading 
              ? const CircularProgressIndicator(color: Colors.white)
              : const Text('Publier', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(

          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _postController,
              maxLines: 8,
              decoration: const InputDecoration(
                hintText: 'Quoi de neuf?',
                border: InputBorder.none,
              ),
            ),
            if (_selectedImages.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Images',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 100,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _selectedImages.length,
                  itemBuilder: (context, index) {
                    return Stack(
                      children: [
                        Container(
                          margin: const EdgeInsets.only(right: 8),
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            image: DecorationImage(
                              image: FileImage(_selectedImages[index]),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        Positioned(
                          top: 0,
                          right: 8,
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedImages.removeAt(index);
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.close,
                                size: 16,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ],
            if (_selectedDocs.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Documents',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _selectedDocs.length,
                itemBuilder: (context, index) {
                  final fileName = _selectedDocs[index].path.split('/').last;
                  return ListTile(
                    leading: const Icon(Icons.insert_drive_file),
                    title: Text(fileName),
                    trailing: IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () {
                        setState(() {
                          _selectedDocs.removeAt(index);
                        });
                      },
                    ),
                  );
                },
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        color: Colors.white,
  child: Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.end, // Aligne à droite
      children: [
        IconButton(
          icon: const Icon(Icons.photo_library),
          onPressed: _pickImage,
          tooltip: 'Ajouter une photo',
        ),
        const SizedBox(width: 12), // Espace entre les icônes
        IconButton(
          icon: const Icon(Icons.attach_file),
          onPressed: _pickDocument,
          tooltip: 'Ajouter un document',
        ),
      ],
    ),
  ),
),

    );
  }
}