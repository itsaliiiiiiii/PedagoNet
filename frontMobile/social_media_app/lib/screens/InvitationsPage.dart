import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:social_media_app/core/Api.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:social_media_app/widgets/NavbarWidget.dart';

class InvitationsPage extends StatefulWidget {
  const InvitationsPage({super.key});

  @override
  State<InvitationsPage> createState() => _InvitationsPageState();
}

class _InvitationsPageState extends State<InvitationsPage>
    with SingleTickerProviderStateMixin {
  String token = '';

  List<Map<String, dynamic>> _pendingInvitations = [];
  //   {
  //     'id': '1',
  //     'sender': {
  //       'id': '101',
  //       'firstName': 'Sophie',
  //       'lastName': 'Martin',
  //       'avatar': 'https://randomuser.me/api/portraits/women/44.jpg',
  //       'role': 'Étudiante',
  //       'department': 'Génie Informatique',
  //       'sentAt': DateTime.now().subtract(const Duration(hours: 2)),
  //     }
  //   },
  //   {
  //     'id': '2',
  //     'sender': {
  //       'id': '102',
  //       'firstName': 'Thomas',
  //       'lastName': 'Dubois',
  //       'avatar': 'https://randomuser.me/api/portraits/men/32.jpg',
  //       'role': 'Professeur',
  //       'department': 'Mathématiques',
  //       'sentAt': DateTime.now().subtract(const Duration(days: 1)),
  //     }
  //   },
  //   {
  //     'id': '3',
  //     'sender': {
  //       'id': '103',
  //       'firstName': 'Léa',
  //       'lastName': 'Bernard',
  //       'avatar': 'https://randomuser.me/api/portraits/women/68.jpg',
  //       'role': 'Étudiante',
  //       'department': 'Génie Civil',
  //       'sentAt': DateTime.now().subtract(const Duration(hours: 5)),
  //     }
  //   },
  // ];

  final List<Map<String, dynamic>> _acceptedInvitations = [
    {
      'id': '4',
      'sender': {
        'id': '104',
        'firstName': 'Antoine',
        'lastName': 'Moreau',
        'avatar': 'https://randomuser.me/api/portraits/men/75.jpg',
        'role': 'Étudiant',
        'department': 'Génie Électrique',
        'acceptedAt': DateTime.now().subtract(const Duration(days: 5)),
      }
    },
    {
      'id': '5',
      'sender': {
        'id': '105',
        'firstName': 'Emma',
        'lastName': 'Petit',
        'avatar': 'https://randomuser.me/api/portraits/women/90.jpg',
        'role': 'Professeure',
        'department': 'Physique',
        'acceptedAt': DateTime.now().subtract(const Duration(days: 7)),
      }
    },
  ];

  bool _isLoading = false;
  late AnimationController _animationController;
  late Animation<double> _animation;

  Future<void> _initToken() async {
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token') ?? "";
  }

  Future<void> _fetchPendingInvitations() async {
    final response = await http.get(
      Uri.parse('${Api.baseUrl}/connections/pending'),
      headers: {'Authorization': 'Bearer $token'},
    );

    print(response.statusCode);
    if (response.statusCode == 200) {
      final Map<String, dynamic> responseData = json.decode(response.body);

      print(responseData);

      final List<dynamic> connectionsData = responseData['pendingConnections'];

      setState(() {
        _pendingInvitations = connectionsData
            .map((post) => post as Map<String, dynamic>)
            .toList();
      });
    } else {
      print('Erreur lors de la récupération des friends');
    }
  }

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    _animationController.forward();
    // _fetchInvitations();
    _initialize();
  }

  void _initialize() async {
    await _initToken();
    await _fetchPendingInvitations();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _handleInvitation(String receiverId, bool accept) async {
    setState(() {
      // _isLoading = true;
    });

    try {
      final String endpoint = accept ? 'accept' : 'refuse';
      final response = await http.put(
        Uri.parse('${Api.baseUrl}/connections/$endpoint/$receiverId'),
        headers: {'Authorization': 'Bearer $token'},
      );

      print(response.statusCode);
      if (response.statusCode == 200) {
        setState(() {
          _fetchPendingInvitations();
        });
        // Simuler la mise à jour des listes pour l'exemple
        // setState(() {
        //   if (accept) {
        //     final invitation = _pendingInvitations
        //         .firstWhere((inv) => inv['id'] == invitationId);
        //     invitation['sender']['acceptedAt'] = DateTime.now();
        //     _acceptedInvitations.add(invitation);
        //   }
        //   _pendingInvitations.removeWhere((inv) => inv['id'] == invitationId);
        //   _isLoading = false;
        // });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text(accept ? 'Invitation acceptée' : 'Invitation refusée'),
            backgroundColor: accept ? Colors.green : Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      } else {
        setState(() {
          _isLoading = false;
        });
        _showErrorSnackBar('Erreur lors du traitement de l\'invitation');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showErrorSnackBar('Erreur de connexion');
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  String _formatTimeAgo(String dateTimeString) {
    DateTime dateTime = DateTime.parse(dateTimeString);

    final Duration difference = DateTime.now().difference(dateTime);

    if (difference.inDays > 365) {
      final years = (difference.inDays / 365).floor();
      return '$years an${years > 1 ? 's' : ''}';
    } else if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return '$months mois';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} jour${difference.inDays > 1 ? 's' : ''}';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} heure${difference.inHours > 1 ? 's' : ''}';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''}';
    } else {
      return 'À l\'instant';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        backgroundColor: Colors.white,
        title: const Text(
          'Invitations',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : FadeTransition(
              opacity: _animation,
              child: CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  if (_pendingInvitations.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.blue[600],
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '${_pendingInvitations.length}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Nouvelles invitations',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (_pendingInvitations.isNotEmpty)
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final invitation = _pendingInvitations[index];
                          // final sender = invitation['sender'];

                          return Padding(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                            child: _buildPendingInvitationCard(invitation),
                          );
                        },
                        childCount: _pendingInvitations.length,
                      ),
                    ),
                  if (_acceptedInvitations.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                        child: const Text(
                          'Invitations acceptées',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                    ),
                  if (_acceptedInvitations.isNotEmpty)
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final invitation = _acceptedInvitations[index];

                          return Padding(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                            child: _buildAcceptedInvitationCard(invitation),
                          );
                        },
                        childCount: _acceptedInvitations.length,
                      ),
                    ),
                  if (_pendingInvitations.isEmpty &&
                      _acceptedInvitations.isEmpty)
                    SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.people_outline,
                              size: 80,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Aucune invitation pour le moment',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey[600],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Vous recevrez des notifications lorsque\nquelqu\'un vous enverra une invitation',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  // Ajouter un espace en bas pour éviter que le contenu soit caché par la navbar
                  const SliverToBoxAdapter(
                    child: SizedBox(height: 80),
                  ),
                ],
              ),
            ),
      bottomNavigationBar: Navbarwidget(
        isBottomNavVisible: true,
        currentIndex: 1,
      ),
    );
  }

  Widget _buildPendingInvitationCard(Map<String, dynamic> invitation) {
    // final sender = invitation['sender'];

    return Card(
      elevation: 2,
      shadowColor: Colors.black26,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Photo de profil à gauche
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.blue.withOpacity(0.3),
                  width: 2,
                ),
              ),
              child: ClipOval(
                child: invitation['profilePhoto'] != null
                    ? Image.network(
                        invitation['profilePhoto'],
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) =>
                            const Icon(
                          Icons.person,
                          size: 40,
                          color: Colors.grey,
                        ),
                      )
                    : const Icon(
                        Icons.person,
                        size: 40,
                        color: Colors.grey,
                      ),
              ),
            ),
            const SizedBox(width: 12),

            // Informations de l'utilisateur au milieu
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${invitation['firstName']} ${invitation['lastName']}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${invitation['role']} ',
                    // ${sender['department']}
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[600],
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 12,
                        color: Colors.grey[500],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Il y a ${_formatTimeAgo(invitation['sentAt'])}',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey[500],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // Boutons à droite
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 90,
                  child: ElevatedButton(
                    onPressed: () =>
                        _handleInvitation(invitation['userId'], true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[600],
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text(
                      'Accepter',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: 90,
                  child: OutlinedButton(
                    onPressed: () => _handleInvitation(invitation['userId'], false),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red[700],
                      side: BorderSide(color: Colors.red[200]!),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text(
                      'Refuser',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAcceptedInvitationCard(Map<String, dynamic> invitation) {
    final sender = invitation['sender'];

    return Card(
      elevation: 1,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: () {
          // Naviguer vers le profil de l'utilisateur
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.green.withOpacity(0.3),
                    width: 2,
                  ),
                ),
                child: ClipOval(
                  child: sender['avatar'] != null
                      ? Image.network(
                          sender['avatar'],
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(
                            Icons.person,
                            size: 30,
                            color: Colors.grey,
                          ),
                        )
                      : const Icon(
                          Icons.person,
                          size: 30,
                          color: Colors.grey,
                        ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${sender['firstName']} ${sender['lastName']}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${sender['role']} · ${sender['department']}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.green[200]!,
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.check_circle,
                      size: 14,
                      color: Colors.green[700],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Accepté',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.green[700],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
