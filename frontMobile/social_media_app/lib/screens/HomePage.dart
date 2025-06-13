import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:social_media_app/provider/PostProvider.dart';
import 'package:social_media_app/screens/classroom/ClassroomPage.dart';
import 'package:social_media_app/screens/CreatePostPage.dart';
import 'package:social_media_app/screens/FriendPage.dart';
import 'package:social_media_app/screens/auth/LoginPage2.dart';
import 'package:social_media_app/screens/MessagesPage.dart';
import 'package:social_media_app/screens/ProfilePage.dart';
import 'package:social_media_app/widgets/NavbarWidget.dart';
import 'package:social_media_app/widgets/homePage/Post/Post.dart';
import 'package:http/http.dart' as http;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';

class AppCacheManager {
  static const key = 'socialAppCache';

  static final CacheManager instance = CacheManager(
    Config(
      key,
      stalePeriod: const Duration(days: 7),
      maxNrOfCacheObjects: 200,
      repo: JsonCacheInfoRepository(databaseName: key),
      fileService: HttpFileService(),
    ),
  );
}

class HomePage extends StatefulWidget {
  String token = "";

  HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage>
    with AutomaticKeepAliveClientMixin {
  List<Map<String, dynamic>> posts = [];
  List<Map<String, dynamic>> friends = [];
  Map<String, dynamic> profile = {};

  bool _isBottomNavVisible = true;
  final ScrollController _scrollController = ScrollController();
  final int _selectedIndex = 0;
  bool _isLoading = true;
  bool _isRefreshing = false;

  @override
  bool get wantKeepAlive => true; // Garde l'état de la page en vie

  @override
  void initState() {
    super.initState();
    _initialize();
    _setupScrollController();

    // Précharger les images visibles
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _precacheVisibleImages();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _setupScrollController() {
    _scrollController.addListener(() {
      // Gestion de la visibilité de la barre de navigation
      if (_scrollController.position.userScrollDirection ==
          ScrollDirection.reverse) {
        if (_isBottomNavVisible) {
          setState(() {
            _isBottomNavVisible = false;
          });
        }
      }

      if (_scrollController.position.userScrollDirection ==
          ScrollDirection.forward) {
        if (!_isBottomNavVisible) {
          setState(() {
            _isBottomNavVisible = true;
          });
        }
      }
    });
  }

  // Précharge les images des posts visibles
  void _precacheVisibleImages() {
    for (var post in posts) {
      if (post['attachments'] != null &&
          post['attachments'].isNotEmpty &&
          post['attachments'][0]['filename'] != null) {
        final filename = post['attachments'][0]['filename'];
        if (filename.isNotEmpty) {
          final imageUrl = '${Api.baseUrl}/uploads/$filename';
          final cacheKey = 'post_${post['id']}_$filename';

          // Précharger l'image
          AppCacheManager.instance.getSingleFile(imageUrl, key: cacheKey);
        }
      }
    }
  }

  Future<void> _initialize() async {
    if (mounted) {
      setState(() {
        _isLoading = true;
      });
    }

    await _initToken();
    await _fetchPosts();
    final postProvider = Provider.of<PostProvider>(context, listen: false);
    for (var post in posts) {
      postProvider.initPost(
        post['id'],
        liked: post['hasLiked'],
        count: post['likesCount'],
      );
    }
    await _fetchFriends();
    await _fetchProfile();

    if (mounted) {
      setState(() {
        _isLoading = false;
      });

      // Précharger les images après le chargement des données
      _precacheVisibleImages();
    }
  }

  Future<void> _refresh() async {
    if (_isRefreshing) return;

    setState(() {
      _isRefreshing = true;
    });

    await _fetchPosts();
    await _fetchFriends();

    setState(() {
      _isRefreshing = false;
    });
  }

  Future<void> _initToken() async {
    final prefs = await SharedPreferences.getInstance();
    widget.token = prefs.getString('token') ?? "";
  }

  Future<void> _fetchProfile() async {
    try {
      final response = await http.get(
        Uri.parse('${Api.baseUrl}/profile/me'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);

        final Map<String, dynamic> profileData = responseData['profile'];

        final String role = profileData['role'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_role', role);

        if (mounted) {
          setState(() {
            print(profileData);
            profile = profileData;
          });
        }
      } else {
        print(
            'Erreur lors de la récupération des posts: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception lors de la récupération des posts: $e');
    }
  }

  Future<void> _fetchPosts() async {
    try {
      final response = await http.get(
        Uri.parse('${Api.baseUrl}/posts'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        final List<dynamic> postData = responseData['posts'];

        if (mounted) {
          setState(() {
            posts =
                postData.map((post) => post as Map<String, dynamic>).toList();
          });
        }
      } else {
        print(
            'Erreur lors de la récupération des posts: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception lors de la récupération des posts: $e');
    }
  }

  Future<void> _fetchFriends() async {
    try {
      final response = await http.get(
        Uri.parse('${Api.baseUrl}/connections'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        final List<dynamic> friendData = responseData['connections'];

        if (mounted) {
          setState(() {
            friends = friendData
                .map((friend) => friend as Map<String, dynamic>)
                .toList();
          });
        }
      } else {
        print(
            'Erreur lors de la récupération des amis: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception lors de la récupération des amis: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Nécessaire pour AutomaticKeepAliveClientMixin

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
                child: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: ClipOval(
                    child: CachedNetworkImage(
                      imageUrl:
                          '${Api.baseUrl}/uploads/${profile['profilePhotoFilename']}' ??
                              'https://example.com/default_profile.png',
                      cacheManager: AppCacheManager.instance,
                      // placeholder: (context, url) =>
                      //     CircularProgressIndicator(),
                      errorWidget: (context, url, error) => Icon(
                        Icons.person,
                        size: 25,
                        color: Color.fromARGB(255, 59, 58, 58),
                      ),
                      fit: BoxFit.cover,
                    ),
                  ),
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
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refresh,
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(10),
                itemCount: posts.length + 1,
                cacheExtent:
                    3000, // Augmente la zone de cache pour éviter le rechargement
                addAutomaticKeepAlives: true, // Garde les éléments en vie
                itemBuilder: (context, index) {
                  if (index == 0) {
                    // Le premier élément est toujours le widget "Quoi de neuf?"
                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                CreatePostPage(token: widget.token),
                          ),
                        ).then((value) {
                          if (value == true) {
                            _fetchPosts();
                          }
                        });
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
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
                            // const CircleAvatar(
                            //   backgroundColor:
                            //       Color.fromARGB(255, 137, 136, 136),
                            //   radius: 20,
                            //   child: Icon(
                            //     Icons.person,
                            //     size: 30,
                            //     color: Color.fromARGB(255, 59, 58, 58),
                            //   ),
                            // ),
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border:
                                    Border.all(color: Colors.white, width: 2),
                              ),
                              child: ClipOval(
                                child: CachedNetworkImage(
                                  imageUrl:
                                      '${Api.baseUrl}/uploads/${profile['profilePhotoFilename']}' ??
                                          'https://example.com/default_profile.png',
                                  cacheManager: AppCacheManager.instance,
                                  // placeholder: (context, url) =>
                                  //     CircularProgressIndicator(),
                                  errorWidget: (context, url, error) => Icon(
                                    Icons.person,
                                    size: 25,
                                    color: Color.fromARGB(255, 59, 58, 58),
                                  ),
                                  fit: BoxFit.cover,
                                ),
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
                    );
                  }

                  // Pour les autres éléments, ce sont des posts
                  final postIndex = index - 1;
                  final post = posts[postIndex];
                  final String authorId = post['author']['id'];
                  String relation = 'foreign';

                  final friend = friends.firstWhere(
                    (f) => f['userId'] == authorId,
                    orElse: () => {},
                  );

                  if (friend.isNotEmpty) {
                    final status = friend['status'];
                    if (status == 'accepted') {
                      relation = 'amis';
                    } else if (status == 'sent') {
                      relation = 'send';
                    }
                  }

                  return RepaintBoundary(
                    child: Post(
                      key: ValueKey('post_${post['id']}'),
                      token: widget.token,
                      authorId: post['author']['id'],
                      postId: post['id'],
                      name: post['author']['firstName']!,
                      role: 'Student',
                      time: post['createdAt']['year']['low'].toString(),
                      description: post['content'],
                      filename: post['attachments'].isNotEmpty
                          ? post['attachments'][0]['filename']
                          : '',
                      authorImage: post['author']['profilePhotoUrl'],
                      likes: post['likesCount'],
                      isLiked: post['hasLiked'],
                      relation: relation,
                    ),
                  );
                },
              ),
            ),
      bottomNavigationBar: Navbarwidget(
        isBottomNavVisible: _isBottomNavVisible,
        currentIndex: 0,
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
                  child: CachedNetworkImage(
                    imageUrl:
                        '${Api.baseUrl}/uploads/${profile['profilePhotoFilename']}' ??
                            'https://example.com/default_profile.png',
                    cacheManager: AppCacheManager.instance,
                    // placeholder: (context, url) => CircularProgressIndicator(),
                    errorWidget: (context, url, error) => Icon(
                      Icons.person,
                      size: 30,
                      color: Color.fromARGB(255, 59, 58, 58),
                    ),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${(profile['firstName'] ?? '')} ${(profile['lastName'] ?? '')}',
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
                builder: (context) =>  FriendsPage(token: widget.token,),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildClassroomSection(BuildContext context) {
    // Code inchangé
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
          leading: Icon(Icons.school_rounded, color: Colors.green[700]),
          title: const Text(
            'Classroom',
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
                builder: (context) => ClassroomPage(token: widget.token),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildAccountSection(BuildContext context) {
    // Code inchangé
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
                builder: (context) => ProfilePage(token: widget.token),
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
          },
        ),
      ],
    );
  }

  Widget _buildFooter(BuildContext context) {
    // Code inchangé
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
                    onPressed: () async {
                      final prefs = await SharedPreferences.getInstance();
                      prefs.remove('token');
                      Provider.of<PostProvider>(context, listen: false).reset();
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => LoginPage(),
                        ),
                      );
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
