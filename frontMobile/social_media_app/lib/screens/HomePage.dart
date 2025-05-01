import 'package:flutter/material.dart';
import 'package:social_media_app/screens/FriendPage.dart';
import 'package:social_media_app/screens/MessagesPage.dart';
import 'package:social_media_app/screens/ProfilePage.dart';
import 'package:social_media_app/widgets/homePage/Post/Post.dart';

class HomePage extends StatelessWidget {
  static const List<Map<String, dynamic>> posts = [
    {
      'name': 'Badr Badr',
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

  const HomePage({Key? key}) : super(key: key);

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
      body: ListView.builder(
        padding: EdgeInsets.all(10),
        itemCount: posts.length,
        itemBuilder: (context, index) {
          final post = posts[index];
          return Post(
              name: post['name']!,
              role: post['role']!,
              time: post['time']!,
              description: post['description'],
              imageUrl: post['imageUrl'],
              likes: post['likes'] ?? 0,
              isLiked: post['isLiked']);
        },
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
          leading: Icon(Icons.calendar_today_rounded, color: Colors.purple[700]),
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
                builder: (context) => ProfilePage(),
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
                content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
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
                      // Navigate to login page
                      Navigator.pushReplacementNamed(context, '/login');
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
