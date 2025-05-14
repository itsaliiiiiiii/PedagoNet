import 'dart:convert';
import 'dart:ffi';

import 'package:flutter/material.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:social_media_app/screens/FriendPage.dart';
import 'package:social_media_app/widgets/homePage/Post/Post.dart';
import 'package:http/http.dart' as http;

class ProfilePage extends StatefulWidget {
  final String token;

  const ProfilePage({super.key, required this.token});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  // final List<Map<String, dynamic>> posts = [
  //   {
  //     'name': 'Anas Zerhoun',
  //     'role': 'Étudiant GI2',
  //     'time': '1h',
  //     'description':
  //         'Voici mon premier post sur l\'app académique ! Voici mon premier post sur l\'app académique ! Voici mon premier post sur l\'app académique !Voici mon premier post sur l\'app académique !',
  //     'imageUrl':
  //         'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
  //     'likes': 12,
  //     'isLiked': false,
  //   },
  //   {
  //     'name': 'Sarah B.',
  //     'role': 'Étudiante GI2',
  //     'time': '2h',
  //     'description': 'Un post sans imageeeeeeeeeeeeeeee.',
  //     'likes': 8,
  //     'isLiked': false,
  //   },
  //   {
  //     'name': 'Sarah B.',
  //     'role': 'Étudiante GI2',
  //     'time': '2h',
  //     'description': 'Nouveau projet en Flutter terminé !',
  //     'imageUrl':
  //         'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
  //     'likes': 15,
  //     'isLiked': true,
  //   },
  //   {
  //     'name': 'Anas Zerhoun',
  //     'role': 'Étudiant GI2',
  //     'time': '1h',
  //     'description': 'Voici mon premier post sur l\'app académique !',
  //     'imageUrl':
  //         'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
  //     'likes': 20,
  //     'isLiked': false,
  //   },
  //   {
  //     'name': 'Sarah B.',
  //     'role': 'Étudiante GI2',
  //     'time': '2h',
  //     'description': 'Nouveau projet en Flutter terminé !',
  //     'imageUrl':
  //         'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
  //     'likes': 9,
  //     'isLiked': false,
  //   },
  //   {
  //     'name': 'Sarah B.',
  //     'role': 'Étudiante GI2',
  //     'time': '2h',
  //     'imageUrl':
  //         'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
  //     'likes': 6,
  //     'isLiked': false,
  //   },
  //   {
  //     'name': 'Anas Zerhoun',
  //     'role': 'Étudiant GI2',
  //     'time': '1h',
  //     'description': 'Voici mon premier post sur l\'app académique !',
  //     'imageUrl':
  //         'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
  //     'likes': 13,
  //     'isLiked': false,
  //   },
  // ];

  Map<String, dynamic>? profile;
  List<dynamic>? posts;

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

  Future<dynamic> fetchPosts(String id_user) async {
    final url = '${Api.baseUrl}/posts/user/$id_user';

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
      );
      print('$id_user');
      if (response.statusCode == 200) {
        print(json.decode(response.body));
        print("hello");
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

  @override
  void initState() {
    super.initState();
    loadProfile();
  }

  void loadProfile() async {
    try {
      final profileData = await fetchProfile();

      print(profileData);
      final postData = await fetchPosts(profileData['profile']['id_user']);

      setState(() {
        profile = profileData['profile'];
        posts = postData['posts'];
      });
    } catch (e) {
      print("Erreur lors du chargement du profil : $e");
    }
  }

  bool isFollowing = false;

  @override
  Widget build(BuildContext context) {
    if (profile == null || posts == nullptr) {
      return Center(child: CircularProgressIndicator());
    }
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildProfileHeader(),
            _buildProfileInfo(),
            _buildProfileStats(),
            _buildProfileActions(),
            _buildDivider(),
            _buildPostsSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      height: 220,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Cover image with gradient overlay
          Container(
            width: double.infinity,
            height: 150,
            decoration: BoxDecoration(
              image: DecorationImage(
                image: NetworkImage(
                  'https://media.licdn.com/dms/image/v2/D4D16AQE-BpAZSleNiQ/profile-displaybackgroundimage-shrink_350_1400/profile-displaybackgroundimage-shrink_350_1400/0/1738106643918?e=1750291200&v=beta&t=yVCaIgS0STCYTViksTxb3GC1Wtl-hXkBaqGksXq5bVo',
                ),
                fit: BoxFit.cover,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
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

          // Profile picture with border and shadow
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
                child: CircleAvatar(
                  radius: 62,
                  backgroundColor: Colors.white,
                  child: ClipOval(
                    child: Image.network(
                      'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
                      fit: BoxFit.cover,
                      width: 124,
                      height: 124,
                    ),
                  ),
                ),
              ),
            ),
          ),

          Positioned(
            top: 10,
            right: 10,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: IconButton(
                icon: Icon(Icons.camera_alt, color: Colors.white, size: 20),
                onPressed: () {},
                tooltip: 'Modifier la photo de couverture',
              ),
            ),
          ),

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
                onPressed: () {},
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
                      '${profile?['firstName']} ${profile?['lastName']}',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '${profile?['bio']}',
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
                            "209 relations",
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
                                  builder: (context) => FriendsPage(),
                                ))
                          },
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 8),
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
                  "Étudiant en génie informatique passionné par le développement mobile et l'intelligence artificielle. Actuellement en 2ème année à l'EMI.",
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
          _buildStatItem("Publications", "67"),
          _buildVerticalDivider(),
          _buildStatItem("Abonnés", "412"),
          _buildVerticalDivider(),
          _buildStatItem("Vues", "1.2K"),
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
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  isFollowing = !isFollowing;
                });
              },
              icon: Icon(
                isFollowing ? Icons.check : Icons.add,
                color: isFollowing ? Colors.grey[700] : Colors.white,
              ),
              label: Text(
                isFollowing ? 'Abonné' : 'S\'abonner',
                style: TextStyle(
                  color: isFollowing ? Colors.grey[700] : Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    isFollowing ? Colors.grey[200] : Colors.blue[600],
                padding: EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: isFollowing ? 0 : 2,
              ),
            ),
          ),
          SizedBox(width: 10),
          ElevatedButton.icon(
            onPressed: () {},
            icon: Icon(Icons.message, color: Colors.blue[700]),
            label: Text(
              'Message',
              style: TextStyle(
                color: Colors.blue[700],
                fontWeight: FontWeight.bold,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: Colors.blue[700]!),
              ),
              elevation: 0,
            ),
          ),
          SizedBox(width: 10),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: IconButton(
              onPressed: () {},
              icon: Icon(Icons.more_horiz, color: Colors.grey[700]),
              tooltip: 'Plus d\'options',
            ),
          ),
        ],
      ),
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
    // if (posts?.length == 0) {
    //   return Center(child: CircularProgressIndicator());
    // }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 15),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Publications",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              TextButton.icon(
                onPressed: () {},
                icon: Icon(Icons.filter_list, size: 18),
                label: Text("Filtrer"),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.grey[700],
                ),
              ),
            ],
          ),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          itemCount: posts?.length,
          itemBuilder: (context, index) {
            final post = posts?[index];
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
                token: widget.token,
                  postId: post?['id'],
                  name: post?['author']?['firstName'] ?? 'Nom inconnu',
                  role: 'Student',
                  time: post?['createdAt']?['year']?['low'].toString() ??
                      'inconnu',
                  description: post?['description'],
                  imageUrl: post?['imageUrl'],
                  likes: post?['likes'] ?? 0,
                  isLiked: true),
            );
          },
        ),
      ],
    );
  }
}
