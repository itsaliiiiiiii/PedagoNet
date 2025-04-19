// import 'package:flutter/material.dart';
// import 'package:social_media_app/widgets/appBar/AppBar.dart';
// import 'package:social_media_app/widgets/homePage/Post/Post.dart';

// class ProfilePage extends StatelessWidget {
//   ProfilePage({super.key});

//   final List<Map<String, dynamic>> posts = [
//     {
//       'name': 'Anas Zerhoun',
//       'role': 'Étudiant GI2',
//       'time': '1h',
//       'description':
//           'Voici mon premier post sur l\'app académique ! Voici mon premier post sur l\'app académique ! Voici mon premier post sur l\'app académique !Voici mon premier post sur l\'app académique !',
//       'imageUrl':
//           'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
//       'likes': 12,
//       'isLiked': false,
//     },
//     {
//       'name': 'Sarah B.',
//       'role': 'Étudiante GI2',
//       'time': '2h',
//       'description': 'Un post sans imageeeeeeeeeeeeeeee.',
//       'likes': 8,
//       'isLiked': false,
//     },
//     {
//       'name': 'Sarah B.',
//       'role': 'Étudiante GI2',
//       'time': '2h',
//       'description': 'Nouveau projet en Flutter terminé !',
//       'imageUrl':
//           'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
//       'likes': 15,
//       'isLiked': true,
//     },
//     {
//       'name': 'Anas Zerhoun',
//       'role': 'Étudiant GI2',
//       'time': '1h',
//       'description': 'Voici mon premier post sur l\'app académique !',
//       'imageUrl':
//           'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
//       'likes': 20,
//       'isLiked': false,
//     },
//     {
//       'name': 'Sarah B.',
//       'role': 'Étudiante GI2',
//       'time': '2h',
//       'description': 'Nouveau projet en Flutter terminé !',
//       'imageUrl':
//           'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
//       'likes': 9,
//       'isLiked': false,
//     },
//     {
//       'name': 'Sarah B.',
//       'role': 'Étudiante GI2',
//       'time': '2h',
//       'imageUrl':
//           'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
//       'likes': 6,
//       'isLiked': false,
//     },
//     {
//       'name': 'Anas Zerhoun',
//       'role': 'Étudiant GI2',
//       'time': '1h',
//       'description': 'Voici mon premier post sur l\'app académique !',
//       'imageUrl':
//           'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
//       'likes': 13,
//       'isLiked': false,
//     },
//   ];

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: Colors.white,
//       appBar: CustomAppBar(),
//       body: SingleChildScrollView(
//         child: Column(
//           children: [
//             SizedBox(
//               height: 200,
//               child: Stack(
//                 children: [
//                   SizedBox(
//                     width: double.infinity,
//                     height: 120,
//                     child: Image.network(
//                       'https://media.licdn.com/dms/image/v2/D4D16AQE-BpAZSleNiQ/profile-displaybackgroundimage-shrink_350_1400/profile-displaybackgroundimage-shrink_350_1400/0/1738106643918?e=1750291200&v=beta&t=yVCaIgS0STCYTViksTxb3GC1Wtl-hXkBaqGksXq5bVo',
//                       fit: BoxFit.cover,
//                     ),
//                   ),
//                   Positioned(
//                     top: 50,
//                     left: 10,
//                     child: CircleAvatar(
//                         radius: 65,
//                         backgroundColor: Colors.white,
//                         child: ClipOval(
//                           child: Image.network(
//                               fit: BoxFit.contain,
//                               'https://media.licdn.com/dms/image/v2/D4D03AQHqpQPzYDNS1A/profile-displayphoto-shrink_800_800/B4DZZDb7PGG8Ag-/0/1744888117952?e=1750291200&v=beta&t=SEj6M9Q8Wb6Lw7mp0GwhaZrVWIq8vdyA1VttUeK9c1E'),
//                         )),
//                   )
//                 ],
//               ),
//             ),
//             Padding(
//               padding: const EdgeInsets.only(bottom: 10, left: 20),
//               child: Row(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Expanded(
//                     child: Column(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         Text(
//                           "Anas Zerhoun",
//                           style: TextStyle(
//                               fontSize: 25, fontWeight: FontWeight.w500),
//                         ),
//                         Text(
//                           "Software engineering",
//                           style: TextStyle(
//                               fontSize: 18,
//                               color: const Color.fromARGB(255, 142, 142, 142)),
//                         )
//                       ],
//                     ),
//                   ),
//                   Padding(
//                     padding: const EdgeInsets.only(top: 8.0,right: 20),
//                     child: Text("209 relations",style: TextStyle(color: Colors.blue),),
//                   )
//                 ],
//               ),
//             ),
//             Divider(
//               height: 80,
//               color: const Color.fromARGB(255, 202, 199, 199),
//               thickness: 6,
//             ),
//             ListView.builder(
//               shrinkWrap: true,
//               physics: NeverScrollableScrollPhysics(),
//               padding: EdgeInsets.all(10),
//               itemCount: posts.length,
//               itemBuilder: (context, index) {
//                 final post = posts[index];
//                 return Post(
//                   name: post['name']!,
//                   role: post['role']!,
//                   time: post['time']!,
//                   description: post['description'],
//                   imageUrl: post['imageUrl'],
//                   likes: post['likes'] ?? 0,
//                   isLiked: post['isLiked'],
//                 );
//               },
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:social_media_app/screens/FriendPage.dart';
import 'package:social_media_app/widgets/homePage/Post/Post.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final List<Map<String, dynamic>> posts = [
    {
      'name': 'Anas Zerhoun',
      'role': 'Étudiant GI2',
      'time': '1h',
      'description':
          'Voici mon premier post sur l\'app académique ! Voici mon premier post sur l\'app académique ! Voici mon premier post sur l\'app académique !Voici mon premier post sur l\'app académique !',
      'imageUrl':
          'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
      'likes': 12,
      'isLiked': false,
    },
    {
      'name': 'Sarah B.',
      'role': 'Étudiante GI2',
      'time': '2h',
      'description': 'Un post sans imageeeeeeeeeeeeeeee.',
      'likes': 8,
      'isLiked': false,
    },
    {
      'name': 'Sarah B.',
      'role': 'Étudiante GI2',
      'time': '2h',
      'description': 'Nouveau projet en Flutter terminé !',
      'imageUrl':
          'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
      'likes': 15,
      'isLiked': true,
    },
    {
      'name': 'Anas Zerhoun',
      'role': 'Étudiant GI2',
      'time': '1h',
      'description': 'Voici mon premier post sur l\'app académique !',
      'imageUrl':
          'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
      'likes': 20,
      'isLiked': false,
    },
    {
      'name': 'Sarah B.',
      'role': 'Étudiante GI2',
      'time': '2h',
      'description': 'Nouveau projet en Flutter terminé !',
      'imageUrl':
          'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
      'likes': 9,
      'isLiked': false,
    },
    {
      'name': 'Sarah B.',
      'role': 'Étudiante GI2',
      'time': '2h',
      'imageUrl':
          'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
      'likes': 6,
      'isLiked': false,
    },
    {
      'name': 'Anas Zerhoun',
      'role': 'Étudiant GI2',
      'time': '1h',
      'description': 'Voici mon premier post sur l\'app académique !',
      'imageUrl':
          'https://media.licdn.com/dms/image/v2/D4D22AQGStRRs6la14g/feedshare-shrink_800/B4DZYXfK8nG4Ag-/0/1744150772065?e=1747267200&v=beta&t=EoR1gz6Usd0RayI-AzPJ93aaxIGoPjYg7RYt0RZMDM0',
      'likes': 13,
      'isLiked': false,
    },
  ];

  bool isFollowing = false;

  @override
  Widget build(BuildContext context) {
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
                      'https://media.licdn.com/dms/image/v2/D4D03AQHqpQPzYDNS1A/profile-displayphoto-shrink_800_800/B4DZZDb7PGG8Ag-/0/1744888117952?e=1750291200&v=beta&t=SEj6M9Q8Wb6Lw7mp0GwhaZrVWIq8vdyA1VttUeK9c1E',
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
                      "Anas Zerhoun",
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      "Software Engineering Student",
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.black54,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                        SizedBox(width: 4),
                        Text(
                          "Rabat, Maroc",
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
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
                          onPressed: ()=>{
                            Navigator.push(context, MaterialPageRoute(
                              builder: (context) => FriendsPage(),
                            ))
                          },
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    "École Mohammadia d'Ingénieurs",
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                      fontWeight: FontWeight.w500,
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
                backgroundColor: isFollowing ? Colors.grey[200] : Colors.blue[600],
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
          itemCount: posts.length,
          itemBuilder: (context, index) {
            final post = posts[index];
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
                name: post['name']!,
                role: post['role']!,
                time: post['time']!,
                description: post['description'],
                imageUrl: post['imageUrl'],
                likes: post['likes'] ?? 0,
                isLiked: post['isLiked'],
              ),
            );
          },
        ),
      ],
    );
  }
}