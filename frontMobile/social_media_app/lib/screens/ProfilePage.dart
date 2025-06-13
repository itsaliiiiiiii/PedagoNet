import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:social_media_app/screens/FriendPage.dart';
import 'package:social_media_app/widgets/homePage/Post/Post.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:http_parser/http_parser.dart';

class ProfilePage extends StatefulWidget {
  final String token;

  const ProfilePage({super.key, required this.token});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  // Variables pour les données du profil
  Map<String, dynamic>? profile;
  List<dynamic>? posts;
  bool isFollowing = false;

  // Variables pour la gestion des images
  File? _selectedProfileImage;
  final ImagePicker _picker = ImagePicker();
  bool _isUploadingProfile = false;

  @override
  void initState() {
    super.initState();
    loadProfile();
  }

  // Méthode pour sélectionner une image depuis la galerie ou la caméra
  Future<void> _pickImage({bool fromCamera = false}) async {
    final XFile? pickedFile = await _picker.pickImage(
      source: fromCamera ? ImageSource.camera : ImageSource.gallery,
      imageQuality: 100,
    );

    if (pickedFile != null) {
      _cropImage(pickedFile.path);
    }
  }

  // Méthode pour afficher un dialogue de choix de source d'image
  void _showImageSourceDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Photo de profil'),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                GestureDetector(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Row(
                      children: [
                        Icon(Icons.photo_library, color: Colors.blue[600]),
                        SizedBox(width: 10),
                        Text('Choisir depuis la galerie'),
                      ],
                    ),
                  ),
                  onTap: () {
                    Navigator.of(context).pop();
                    _pickImage(fromCamera: false);
                  },
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Divider(),
                ),
                GestureDetector(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Row(
                      children: [
                        Icon(Icons.camera_alt, color: Colors.blue[600]),
                        SizedBox(width: 10),
                        Text('Prendre une photo'),
                      ],
                    ),
                  ),
                  onTap: () {
                    Navigator.of(context).pop();
                    _pickImage(fromCamera: true);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // Méthode pour recadrer l'image
  Future<void> _cropImage(String imagePath) async {
    final croppedFile = await ImageCropper().cropImage(
      sourcePath: imagePath,
      aspectRatio: CropAspectRatio(ratioX: 1, ratioY: 1),
      cropStyle: CropStyle.circle,
      uiSettings: [
        AndroidUiSettings(
          toolbarTitle: 'Recadrer votre photo de profil',
          toolbarColor: Colors.blue[600],
          toolbarWidgetColor: Colors.white,
          initAspectRatio: CropAspectRatioPreset.square,
          lockAspectRatio: true,
          hideBottomControls: false,
          statusBarColor: Colors.blue[600],
        ),
        IOSUiSettings(
          title: 'Recadrer votre photo de profil',
          doneButtonTitle: 'Terminer',
          cancelButtonTitle: 'Annuler',
          aspectRatioLockEnabled: true,
        ),
      ],
    );

    if (croppedFile != null) {
      setState(() {
        _selectedProfileImage = File(croppedFile.path);
      });

      // Télécharger l'image recadrée
      _uploadProfileImage();
    }
  }

  // Méthode pour télécharger l'image de profil
  Future<void> _uploadProfileImage() async {
    if (_selectedProfileImage == null) return;

    setState(() {
      _isUploadingProfile = true;
    });

    try {
      // Créer une requête multipart
      var request = http.MultipartRequest(
        'PUT',
        Uri.parse('${Api.baseUrl}/profile/photo'),
      );

      // Ajouter le token d'authentification
      request.headers['Authorization'] = 'Bearer ${widget.token}';

      // Ajouter le fichier image
      request.files.add(await http.MultipartFile.fromPath(
        'profilePhoto',
        _selectedProfileImage!.path,
        contentType: MediaType('image', 'jpeg'),
      ));

      // Envoyer la requête
      var response = await request.send();
      var responseBody = await response.stream.bytesToString();
      print('Response status: ${response.statusCode}');
      print('Response body: $responseBody');

      if (response.statusCode == 200) {
        // Recharger les données du profil pour afficher la nouvelle image
        loadProfile();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Photo de profil mise à jour avec succès')),
        );
      } else {
        // Gérer l'erreur
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(
                  'Erreur lors du téléchargement de l\'image: ${response.statusCode}')),
        );
      }
    } catch (e) {
      print('Erreur lors du téléchargement: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    } finally {
      setState(() {
        _isUploadingProfile = false;
      });
    }
  }

  Future<dynamic> fetchProfile() async {
    final url = '${Api.baseUrl}/profile/me';

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        print('Profile response: ${response.body}');
        return json.decode(response.body);
      } else {
        print("Erreur HTTP: ${response.statusCode}");
        throw Exception('Failed to fetch profile: ${response.statusCode}');
      }
    } catch (e) {
      print("Erreur de requête: $e");
      throw Exception('Error fetching profile: $e');
    }
  }

  Future<dynamic> fetchPosts(String idUser) async {
    final url = '${Api.baseUrl}/posts/user/$idUser';

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        print("Erreur HTTP: ${response.statusCode}");
        throw Exception('Failed to fetch posts: ${response.statusCode}');
      }
    } catch (e) {
      print("Erreur de requête: $e");
      throw Exception('Error fetching posts: $e');
    }
  }

  void loadProfile() async {
    try {
      final profileData = await fetchProfile();

      if (profileData != null && profileData['profile'] != null) {
        // final postData = await fetchPosts(profileData['profile']['id_user']);

        if (mounted) {
          setState(() {
            profile = profileData['profile'];
            // posts = postData['posts'];
          });
        }
      }
    } catch (e) {
      print("Erreur lors du chargement du profil : $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur lors du chargement du profil')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (profile == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(),
      body: RefreshIndicator(
        onRefresh: () async {
          loadProfile();
        },
        child: SingleChildScrollView(
          physics: AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              _buildProfileHeader(),
              _buildProfileInfo(),
              _buildProfileStats(),
              _buildDivider(),
              _buildPostsSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    return SizedBox(
      height: 220,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Photo de couverture avec overlay gradient
          Container(
            width: double.infinity,
            height: 150,
            color: Colors.blue[100],
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.3),
                  ],
                ),
              ),
            ),
          ),

          // Photo de profil avec bordure et ombre
          Positioned(
            top: 85,
            left: 20,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: CircleAvatar(
                radius: 65,
                backgroundColor: Colors.white,
                child: _isUploadingProfile
                    ? CircularProgressIndicator()
                    : CircleAvatar(
                        radius: 62,
                        backgroundColor: Colors.white,
                        child: _selectedProfileImage != null
                            ? ClipOval(
                                child: Image.file(
                                  _selectedProfileImage!,
                                  width: 124,
                                  height: 124,
                                  fit: BoxFit.cover,
                                ),
                              )
                            : _buildProfileImage(),
                      ),
              ),
            ),
          ),

          // Bouton pour modifier la photo de profil
          Positioned(
            top: 180,
            left: 105,
            child: Container(
              width: 30,
              decoration: BoxDecoration(
                color: Colors.blue[600],
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
              child: IconButton(
                icon: Icon(Icons.camera_alt, color: Colors.white, size: 16),
                onPressed: () => _showImageSourceDialog(),
                constraints: BoxConstraints.tightFor(width: 30, height: 30),
                padding: EdgeInsets.zero,
                tooltip: 'Modifier la photo de profil',
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Méthode séparée pour construire l'image de profil avec gestion d'erreur
  Widget _buildProfileImage() {
    // Vérifier si nous avons une URL d'image de profil
    if (profile != null) {
      // Afficher tous les champs du profil pour le débogage
      print('Profile data: $profile');

      // Vérifier les différentes clés possibles pour l'URL de l'image
      String? imageUrl;

      if (profile!.containsKey('profilePhotoFilename') &&
          profile!['profilePhotoFilename'] != null) {
        imageUrl = '${Api.baseUrl}/uploads/${profile!['profilePhotoFilename']}';
      } else if (profile!.containsKey('avatarUrl') &&
          profile!['avatarUrl'] != null) {
        imageUrl = '${Api.baseUrl}/uploads/${profile!['avatarUrl']}';
      } else if (profile!.containsKey('photoUrl') &&
          profile!['photoUrl'] != null) {
        imageUrl = profile!['photoUrl'];
      }

      if (imageUrl != null) {
        print('Using profile image URL: $imageUrl');
        return ClipOval(
          child: CachedNetworkImage(
            imageUrl: imageUrl,
            width: 124,
            height: 124,
            fit: BoxFit.cover,
            placeholder: (context, url) => CircularProgressIndicator(),
            errorWidget: (context, url, error) {
              print('Error loading image: $error');
              return Icon(
                Icons.person,
                size: 50,
                color: Colors.grey[700],
              );
            },
          ),
        );
      }
    }

    // Fallback à l'icône par défaut
    return Icon(
      Icons.person,
      size: 50,
      color: Colors.grey[700],
    );
  }

  Widget _buildProfileInfo() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${profile?['firstName'] ?? ''} ${profile?['lastName'] ?? ''}',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      profile?['bio'] ?? 'Aucune bio',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.black54,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 4),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.people, size: 16, color: Colors.blue[700]),
                        SizedBox(width: 4),
                        TextButton(
                          child: Text(
                            "Relations",
                            style: TextStyle(
                              color: Colors.blue[700],
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          onPressed: () => {
                            Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => FriendsPage(token: widget.token,),
                                ))
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(height: 16),
          Container(
            padding: EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  spreadRadius: 0,
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "À propos",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  profile?['about'] ??
                      "Étudiant en génie informatique passionné par le développement mobile.",
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.black87,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileStats() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem("Publications", posts?.length.toString() ?? "0"),
          _buildVerticalDivider(),
          _buildStatItem(
              "Abonnés", profile?['followersCount']?.toString() ?? "0"),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildVerticalDivider() {
    return Container(
      height: 40,
      width: 1,
      color: Colors.grey[300],
    );
  }

  Widget _buildProfileActions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Row(
        children: [
          SizedBox(width: 10),
          
          SizedBox(width: 10),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: IconButton(
              onPressed: () {
                _showOptionsMenu();
              },
              icon: Icon(Icons.more_horiz, color: Colors.grey[700]),
              tooltip: 'Plus d\'options',
            ),
          ),
        ],
      ),
    );
  }

  void _showOptionsMenu() {
    showModalBottomSheet(
      context: context,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: Icon(Icons.edit, color: Colors.blue[600]),
                title: Text('Modifier le profil'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: Icon(Icons.settings, color: Colors.blue[600]),
                title: Text('Paramètres du compte'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDivider() {
    return Container(
      height: 8,
      color: Colors.grey[200],
      margin: EdgeInsets.symmetric(vertical: 10),
    );
  }

  Widget _buildPostsSection() {
    if (posts == null || posts!.isEmpty) {
      return Container(
        padding: EdgeInsets.all(20),
        child: Center(
          child: Column(
            children: [
              Icon(
                Icons.post_add,
                size: 60,
                color: Colors.grey[400],
              ),
              SizedBox(height: 16),
              Text(
                "Aucune publication pour le moment",
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 15),
          child: Text(
            "Publications",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          itemCount: posts!.length,
          itemBuilder: (context, index) {
            final post = posts![index];
            return Container(
              margin: EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Post(
                key: ValueKey('post_${post['id']}'),
                authorId: post['author']?['id'] ?? '',
                relation: '',
                token: widget.token,
                postId: post['id'],
                name: post['author']?['firstName'] ?? 'Nom inconnu',
                role: 'Student',
                time:
                    post['createdAt']?['year']?['low']?.toString() ?? 'inconnu',
                description: post['content'],
                filename: post['attachments'].isNotEmpty
                    ? post['attachments'][0]['filename']
                    : '',
                likes: post['likesCount'] ?? 0,
                isLiked: post['hasLiked'] ?? false,
                authorImage: post['author']['profilePhotoUrl'],
              ),
            );
          },
        ),
      ],
    );
  }
}
