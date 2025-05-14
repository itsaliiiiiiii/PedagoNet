import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:social_media_app/screens/CreatePostPage.dart';
import 'package:social_media_app/screens/FriendPage.dart';
import 'package:social_media_app/screens/MessagesPage.dart';
import 'package:social_media_app/screens/ProfilePage.dart';
import 'package:social_media_app/widgets/homePage/Post/Post.dart';
import 'package:http/http.dart' as http;

class HomePage extends StatefulWidget {
  final String token;

  HomePage({required this.token});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  List<Map<String, dynamic>> posts = [];

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  Future<void> _fetchPosts() async {
    print("token ${widget.token}");
    final response = await http.get(
      Uri.parse('${Api.baseUrl}/posts'),
      headers: {'Authorization': 'Bearer ${widget.token}'},
    );

    if (response.statusCode == 200) {
      print('response : ${response.body}');
      // Décoder la réponse JSON
      final Map<String, dynamic> responseData = json.decode(response.body);

      // Extraire la liste des posts
      final List<dynamic> postData = responseData['posts'];

      // Mettre à jour l'état avec les données des posts
      print('likesCount: ${postData[0]['likesCount']}');

      setState(() {
        posts = postData.map((post) => post as Map<String, dynamic>).toList();
      });
    } else {
      print('Erreur lors de la récupération des posts');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        width: 280,
        child: Column(
          children: [
            _buildDrawerHeader(context),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _buildMainNavigation(context),
                  const Divider(height: 1),
                  _buildClassroomSection(context),
                  const Divider(height: 1),
                  _buildAccountSection(context),
                ],
              ),
            ),
            _buildFooter(context),
          ],
        ),
      ),
      backgroundColor: Theme.of(context).primaryColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        toolbarHeight: 55,
        elevation: 0,
        title: Row(
          children: [
            Builder(
              builder: (context) => GestureDetector(
                onTap: () {
                  Scaffold.of(context).openDrawer();
                },
                child: const CircleAvatar(
                  child: Icon(
                    Icons.person,
                    size: 30,
                    color: Color.fromARGB(255, 59, 58, 58),
                  ),
                  backgroundColor: Color.fromARGB(255, 137, 136, 136),
                  radius: 20,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: SizedBox(
                height: 35,
                child: TextField(
                  cursorColor: Color.fromARGB(255, 84, 87, 89),
                  cursorWidth: 2.5,
                  cursorRadius: Radius.zero,
                  style: const TextStyle(fontSize: 14),
                  decoration: InputDecoration(
                    isDense: true,
                    hintText: 'Rechercher...',
                    prefixIcon: Icon(
                      Icons.search,
                      size: 20,
                      color: Colors.grey,
                    ),
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: const BorderSide(
                        color: Color.fromARGB(41, 158, 158, 158),
                        width: 1.0,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: const BorderSide(
                        color: Color.fromARGB(182, 158, 158, 158),
                        width: 1.0,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(
                        color: Color.fromARGB(220, 93, 97, 100),
                        width: 1.5,
                      ),
                    ),
                    filled: true,
                    fillColor: Colors.grey[100],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            IconButton(
              icon: const Icon(Icons.message),
              color: Colors.grey[800],
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MessagesPage(),
                  ),
                );
              },
            ),
          ],
        ),
      ),
      body: ListView(
  padding: const EdgeInsets.all(10),
  children: [
    GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => CreatePostPage(token: widget.token),
          ),
        ).then((value) {
          if (value == true) {
            _fetchPosts();
          }
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            const CircleAvatar(
              backgroundColor: Color.fromARGB(255, 137, 136, 136),
              radius: 20,
              child: Icon(
                Icons.person,
                size: 30,
                color: Color.fromARGB(255, 59, 58, 58),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Quoi de neuf?',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 16,
                ),
              ),
            ),
            Icon(
              Icons.photo_library,
              color: Colors.blue[400],
            ),
            const SizedBox(width: 12),
            Icon(
              Icons.attach_file,
              color: Colors.green[400],
            ),
          ],
        ),
      ),
    ),
    ...posts.map((post) => Post(
      token: widget.token,
      postId: post['id'],
      name: post['author']['firstName']!,
      role: 'Student',
      time: post['createdAt']['year']['low'].toString(),
      description: post['content'],
      imageUrl: post['imageUrl'],
      likes: post['likesCount'],
      isLiked: false,
    )),
  ],
),

    );
  }

  Widget _buildDrawerHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 50, 16, 16),
      decoration: BoxDecoration(
        color: Colors.blue[600],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: ClipOval(
                  child: Image.network(
                    'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Anas Zerhoun',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '@anas.z',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.school,
                  color: Colors.white,
                  size: 16,
                ),
                SizedBox(width: 6),
                Text(
                  'Génie Informatique - 2A',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMainNavigation(BuildContext context) {
    return Column(
      children: [
        ListTile(
          leading: Icon(Icons.home_rounded, color: Colors.blue[700]),
          title: const Text(
            'Accueil',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            // Navigate to home page if not already there
          },
        ),
        ListTile(
          leading: Icon(Icons.message_rounded, color: Colors.blue[700]),
          title: const Text(
            'Messages',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          trailing: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.red[400],
              shape: BoxShape.circle,
            ),
            child: const Text(
              '7',
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const MessagesPage(),
              ),
            );
          },
        ),
        ListTile(
          leading: Icon(Icons.people_alt_rounded, color: Colors.blue[700]),
          title: const Text(
            'Amis',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const FriendsPage(),
              ),
            );
          },
        ),
        ListTile(
          leading: Icon(Icons.notifications_rounded, color: Colors.blue[700]),
          title: const Text(
            'Notifications',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          trailing: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.red[400],
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              'Nouveau',
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            // Navigate to notifications page
          },
        ),
      ],
    );
  }

  Widget _buildClassroomSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'CLASSROOM',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
              letterSpacing: 1.2,
            ),
          ),
        ),
        ListTile(
          leading: Icon(Icons.book_rounded, color: Colors.green[700]),
          title: const Text(
            'Mes cours',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            // Navigate to courses page
          },
        ),
        ListTile(
          leading: Icon(Icons.assignment_rounded, color: Colors.orange[700]),
          title: const Text(
            'Devoirs',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          trailing: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.orange[400],
              shape: BoxShape.circle,
            ),
            child: const Text(
              '3',
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            // Navigate to assignments page
          },
        ),
        ListTile(
          leading:
              Icon(Icons.calendar_today_rounded, color: Colors.purple[700]),
          title: const Text(
            'Emploi du temps',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            // Navigate to schedule page
          },
        ),
        ListTile(
          leading: Icon(Icons.quiz_rounded, color: Colors.blue[700]),
          title: const Text(
            'Examens',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            // Navigate to exams page
          },
        ),
      ],
    );
  }

  Widget _buildAccountSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'COMPTE',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
              letterSpacing: 1.2,
            ),
          ),
        ),
        ListTile(
          leading: Icon(Icons.person_rounded, color: Colors.blue[700]),
          title: const Text(
            'Mon profil',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ProfilePage(token:widget.token),
              ),
            );
          },
        ),
        ListTile(
          leading: Icon(Icons.settings_rounded, color: Colors.grey[700]),
          title: const Text(
            'Paramètres',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            // Navigate to settings page
          },
        ),
        ListTile(
          leading: Icon(Icons.help_outline_rounded, color: Colors.grey[700]),
          title: const Text(
            'Aide et support',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          onTap: () {
            Navigator.pop(context);
            // Navigate to help page
          },
        ),
      ],
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          Navigator.pop(context);
          // Handle logout
          showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: const Text('Déconnexion'),
                content:
                    const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    child: const Text('Annuler'),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      // Perform logout action
                    },
                    child: const Text('Déconnecter'),
                  ),
                ],
              );
            },
          );
        },
        child: Row(
          children: [
            Icon(
              Icons.logout_rounded,
              color: Colors.red[600],
              size: 20,
            ),
            const SizedBox(width: 12),
            const Text(
              'Déconnexion',
              style: TextStyle(
                color: Colors.red,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
