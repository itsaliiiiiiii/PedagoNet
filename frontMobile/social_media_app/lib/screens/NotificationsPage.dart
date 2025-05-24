import 'package:flutter/material.dart';
import 'package:social_media_app/widgets/NavbarWidget.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  final bool _isLoading = false;
  
  // Données statiques pour les notifications
  final List<Map<String, dynamic>> _notifications = [
    {
      'id': '1',
      'type': 'like',
      'isRead': false,
      'timestamp': DateTime.now().subtract(const Duration(minutes: 5)),
      'actor': {
        'name': 'Sarah Dupont',
        'avatar': 'https://randomuser.me/api/portraits/women/12.jpg',
      },
      'content': 'a aimé votre publication',
      'target': 'Comment optimiser son temps d\'étude',
    },
    {
      'id': '2',
      'type': 'comment',
      'isRead': false,
      'timestamp': DateTime.now().subtract(const Duration(hours: 1)),
      'actor': {
        'name': 'Marc Leroy',
        'avatar': 'https://randomuser.me/api/portraits/men/45.jpg',
      },
      'content': 'a commenté votre publication',
      'target': 'Projet de fin d\'année',
      'comment': 'Super projet ! J\'aimerais en savoir plus sur la méthodologie que vous avez utilisée.'
    },
    {
      'id': '3',
      'type': 'mention',
      'isRead': true,
      'timestamp': DateTime.now().subtract(const Duration(hours: 3)),
      'actor': {
        'name': 'Julie Martin',
        'avatar': 'https://randomuser.me/api/portraits/women/22.jpg',
      },
      'content': 'vous a mentionné dans un commentaire',
      'target': 'Événement de networking',
    },
    {
      'id': '4',
      'type': 'friend_request',
      'isRead': false,
      'timestamp': DateTime.now().subtract(const Duration(hours: 5)),
      'actor': {
        'name': 'Thomas Bernard',
        'avatar': 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      'content': 'vous a envoyé une demande d\'ami',
    },
    {
      'id': '5',
      'type': 'event',
      'isRead': true,
      'timestamp': DateTime.now().subtract(const Duration(days: 1)),
      'content': 'Rappel: Conférence sur l\'IA demain à 14h',
      'location': 'Amphithéâtre A',
    },
    {
      'id': '6',
      'type': 'assignment',
      'isRead': true,
      'timestamp': DateTime.now().subtract(const Duration(days: 1, hours: 6)),
      'content': 'Nouveau devoir disponible',
      'target': 'Mathématiques Avancées',
      'deadline': DateTime.now().add(const Duration(days: 7)),
    },
    {
      'id': '7',
      'type': 'message',
      'isRead': false,
      'timestamp': DateTime.now().subtract(const Duration(days: 2)),
      'actor': {
        'name': 'Groupe de Projet',
        'avatar': null,
      },
      'content': 'Nouveau message dans le groupe',
      'message': 'Bonjour à tous, n\'oubliez pas la réunion de demain !',
    },
    {
      'id': '8',
      'type': 'grade',
      'isRead': true,
      'timestamp': DateTime.now().subtract(const Duration(days: 3)),
      'content': 'Nouvelle note disponible',
      'target': 'Programmation Orientée Objet',
      'grade': '18/20',
    },
  ];

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
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  String _formatTimeAgo(DateTime dateTime) {
    final Duration difference = DateTime.now().difference(dateTime);
    
    if (difference.inDays > 365) {
      return '${(difference.inDays / 365).floor()} an${(difference.inDays / 365).floor() > 1 ? 's' : ''}';
    } else if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()} mois';
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

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'like':
        return Icons.favorite;
      case 'comment':
        return Icons.comment;
      case 'mention':
        return Icons.alternate_email;
      case 'friend_request':
        return Icons.person_add;
      case 'event':
        return Icons.event;
      case 'assignment':
        return Icons.assignment;
      case 'message':
        return Icons.message;
      case 'grade':
        return Icons.grade;
      default:
        return Icons.notifications;
    }
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'like':
        return Colors.red;
      case 'comment':
        return Colors.blue;
      case 'mention':
        return Colors.purple;
      case 'friend_request':
        return Colors.green;
      case 'event':
        return Colors.amber;
      case 'assignment':
        return Colors.orange;
      case 'message':
        return Colors.teal;
      case 'grade':
        return Colors.indigo;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    int unreadCount = _notifications.where((notif) => !notif['isRead']).length;
    
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        automaticallyImplyLeading: false, // Supprime la flèche de retour
        elevation: 0,
        backgroundColor: Colors.white,
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all, color: Colors.black87),
            onPressed: () {
              setState(() {
                for (var notification in _notifications) {
                  notification['isRead'] = true;
                }
              });
            },
            tooltip: 'Marquer tout comme lu',
          ),
        ],
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
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                      child: Row(
                        children: [
                          if (unreadCount > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.blue[600],
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '$unreadCount',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          if (unreadCount > 0)
                            const SizedBox(width: 8),
                          Text(
                            unreadCount > 0 ? 'Non lues' : 'Toutes les notifications',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final notification = _notifications[index];
                        
                        return _buildNotificationCard(notification);
                      },
                      childCount: _notifications.length,
                    ),
                  ),
                  // Ajouter un espace en bas pour éviter que le contenu soit caché par la navbar
                  const SliverToBoxAdapter(
                    child: SizedBox(height: 80),
                  ),
                ],
              ),
            ),
            bottomNavigationBar: Navbarwidget(isBottomNavVisible: true, currentIndex: 2),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notification) {
    final bool isRead = notification['isRead'];
    final String type = notification['type'];
    final IconData icon = _getNotificationIcon(type);
    final Color iconColor = _getNotificationColor(type);
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 3), // Réduit l'espacement vertical
      child: Card(
        elevation: isRead ? 0 : 1, // Réduit l'élévation
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12), // Réduit le rayon des coins
        ),
        color: isRead ? Colors.white : Colors.white,
        child: InkWell(
          onTap: () {
            setState(() {
              notification['isRead'] = true;
            });
            // Naviguer vers le contenu de la notification
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), // Réduit le padding
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Indicateur de non-lu
                if (!isRead)
                  Container(
                    width: 6, // Plus petit
                    height: 6, // Plus petit
                    margin: const EdgeInsets.only(top: 8, right: 6), // Ajusté
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.blue[600],
                    ),
                  ),
                
                // Avatar ou icône
                if (notification.containsKey('actor') && notification['actor']['avatar'] != null)
                  Container(
                    width: 40, // Plus petit
                    height: 40, // Plus petit
                    margin: EdgeInsets.only(right: 12, left: isRead ? 12 : 6), // Ajusté
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: iconColor.withOpacity(0.3),
                        width: 1.5, // Plus fin
                      ),
                    ),
                    child: ClipOval(
                      child: Image.network(
                        notification['actor']['avatar'],
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Icon(
                          icon,
                          size: 24, // Plus petit
                          color: iconColor,
                        ),
                      ),
                    ),
                  )
                else
                  Container(
                    width: 40, // Plus petit
                    height: 40, // Plus petit
                    margin: EdgeInsets.only(right: 12, left: isRead ? 12 : 6), // Ajusté
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: iconColor.withOpacity(0.1),
                      border: Border.all(
                        color: iconColor.withOpacity(0.3),
                        width: 1.5, // Plus fin
                      ),
                    ),
                    child: Icon(
                      icon,
                      size: 20, // Plus petit
                      color: iconColor,
                    ),
                  ),
                
                // Contenu de la notification
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Titre de la notification
                      RichText(
                        text: TextSpan(
                          style: const TextStyle(
                            fontSize: 13, // Plus petit
                            color: Colors.black87,
                          ),
                          children: [
                            if (notification.containsKey('actor'))
                              TextSpan(
                                text: notification['actor']['name'],
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            TextSpan(
                              text: ' ${notification['content']}',
                            ),
                            if (notification.containsKey('target'))
                              TextSpan(
                                text: ' "${notification['target']}"',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 2), // Plus petit
                      
                      // Détails supplémentaires selon le type
                      if (notification.containsKey('comment'))
                        Container(
                          margin: const EdgeInsets.only(top: 3, bottom: 4), // Plus petit
                          padding: const EdgeInsets.all(8), // Plus petit
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(6), // Plus petit
                          ),
                          child: Text(
                            '"${notification['comment']}"',
                            style: TextStyle(
                              fontSize: 12, // Plus petit
                              color: Colors.grey[800],
                              fontStyle: FontStyle.italic,
                            ),
                            maxLines: 2, // Limite le nombre de lignes
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        
                      if (notification.containsKey('message'))
                        Container(
                          margin: const EdgeInsets.only(top: 3, bottom: 4), // Plus petit
                          padding: const EdgeInsets.all(8), // Plus petit
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(6), // Plus petit
                          ),
                          child: Text(
                            notification['message'],
                            style: TextStyle(
                              fontSize: 12, // Plus petit
                              color: Colors.grey[800],
                            ),
                            maxLines: 2, // Limite le nombre de lignes
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        
                      if (notification.containsKey('grade'))
                        Container(
                          margin: const EdgeInsets.only(top: 3, bottom: 4), // Plus petit
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), // Plus petit
                          decoration: BoxDecoration(
                            color: Colors.green[50],
                            borderRadius: BorderRadius.circular(6), // Plus petit
                            border: Border.all(
                              color: Colors.green[200]!,
                              width: 1,
                            ),
                          ),
                          child: Text(
                            notification['grade'],
                            style: TextStyle(
                              fontSize: 12, // Plus petit
                              color: Colors.green[700],
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        
                      if (notification.containsKey('location'))
                        Row(
                          children: [
                            Icon(
                              Icons.location_on,
                              size: 12, // Plus petit
                              color: Colors.grey[600],
                            ),
                            const SizedBox(width: 3), // Plus petit
                            Text(
                              notification['location'],
                              style: TextStyle(
                                fontSize: 12, // Plus petit
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                        
                      if (notification.containsKey('deadline'))
                        Row(
                          children: [
                            Icon(
                              Icons.access_time,
                              size: 12, // Plus petit
                              color: Colors.red[400],
                            ),
                            const SizedBox(width: 3), // Plus petit
                            Text(
                              'À rendre avant le ${notification['deadline'].day}/${notification['deadline'].month}',
                              style: TextStyle(
                                fontSize: 12, // Plus petit
                                color: Colors.red[400],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      
                      // Horodatage
                      Padding(
                        padding: const EdgeInsets.only(top: 4), // Plus petit
                        child: Row(
                          children: [
                            Icon(
                              Icons.access_time,
                              size: 10, // Plus petit
                              color: Colors.grey[500],
                            ),
                            const SizedBox(width: 3), // Plus petit
                            Text(
                              'Il y a ${_formatTimeAgo(notification['timestamp'])}',
                              style: TextStyle(
                                fontSize: 10, // Plus petit
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}