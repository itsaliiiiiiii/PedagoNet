import 'package:flutter/material.dart';
import 'package:social_media_app/screens/classroom/CreateTask.dart';
import 'package:social_media_app/screens/classroom/UploadDevoir.dart';

class CourseDetailsPage extends StatefulWidget {
  final Map<dynamic, dynamic> course;
  final String token;
  final bool isProfessor;

  const CourseDetailsPage({
    super.key,
    required this.course,
    required this.token,
    required this.isProfessor
  });

  @override
  State<CourseDetailsPage> createState() => _CourseDetailsPageState();
}

class _CourseDetailsPageState extends State<CourseDetailsPage>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  late TabController _tabController; // Ajout du TabController
  final bool _isLoading = false;

  // Données statiques pour les uploads du professeur
  final List<Map<String, dynamic>> _recentUploads = [
    {
      'id': '1',
      'title': 'Chapitre 7 - Héritage et Polymorphisme',
      'type': 'pdf',
      'size': '2.4 MB',
      'uploadDate': DateTime.now().subtract(const Duration(hours: 3)),
      'description': 'Cours complet sur l\'héritage et le polymorphisme en POO',
      'downloadCount': 23,
    },
    {
      'id': '2',
      'title': 'TP 5 - Exercices Pratiques',
      'type': 'zip',
      'size': '1.8 MB',
      'uploadDate': DateTime.now().subtract(const Duration(days: 1)),
      'description': 'Fichiers sources et énoncés pour le TP 5',
      'downloadCount': 45,
    },
    {
      'id': '3',
      'title': 'Correction Examen Partiel',
      'type': 'pdf',
      'size': '856 KB',
      'uploadDate': DateTime.now().subtract(const Duration(days: 2)),
      'description': 'Correction détaillée de l\'examen partiel',
      'downloadCount': 67,
    },
    {
      'id': '4',
      'title': 'Projet Final - Spécifications',
      'type': 'docx',
      'size': '1.2 MB',
      'uploadDate': DateTime.now().subtract(const Duration(days: 3)),
      'description': 'Cahier des charges complet pour le projet final',
      'downloadCount': 38,
    },
    {
      'id': '5',
      'title': 'Vidéo - Design Patterns',
      'type': 'mp4',
      'size': '45.6 MB',
      'uploadDate': DateTime.now().subtract(const Duration(days: 5)),
      'description': 'Conférence enregistrée sur les design patterns',
      'downloadCount': 29,
    },
  ];

  final List<Map<String, dynamic>> _assignments = [
    {
      'id': '1',
      'title': 'Projet Final POO',
      'dueDate': DateTime.now().add(const Duration(days: 14)),
      'status': 'En cours',
      'points': 100,
      'submitted': false,
    },
    {
      'id': '2',
      'title': 'TP 6 - Interfaces',
      'dueDate': DateTime.now().add(const Duration(days: 7)),
      'status': 'Non commencé',
      'points': 20,
      'submitted': false,
    },
    {
      'id': '3',
      'title': 'Quiz Chapitre 6',
      'dueDate': DateTime.now().subtract(const Duration(days: 2)),
      'status': 'Rendu',
      'points': 15,
      'submitted': true,
      'grade': 14,
    },
  ];

  final List<Map<String, dynamic>> _announcements = [
    {
      'id': '1',
      'title': 'Changement d\'horaire',
      'content':
          'Le cours de demain est reporté à 14h au lieu de 10h en raison d\'une réunion.',
      'timestamp': DateTime.now().subtract(const Duration(hours: 2)),
      'important': true,
    },
    {
      'id': '2',
      'title': 'Nouveau matériel disponible',
      'content':
          'Les slides du chapitre 7 et les exercices pratiques sont maintenant disponibles.',
      'timestamp': DateTime.now().subtract(const Duration(hours: 6)),
      'important': false,
    },
  ];

  @override
  void initState() {
    super.initState();

    // Initialisation de l'AnimationController
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );

    // Initialisation du TabController
    _tabController = TabController(
      length: 3, // Nombre d'onglets
      vsync: this,
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _tabController.dispose(); // Dispose du TabController
    super.dispose();
  }

  String _formatTimeAgo(DateTime dateTime) {
    final Duration difference = DateTime.now().difference(dateTime);

    if (difference.inDays > 0) {
      return 'Il y a ${difference.inDays} jour${difference.inDays > 1 ? 's' : ''}';
    } else if (difference.inHours > 0) {
      return 'Il y a ${difference.inHours} heure${difference.inHours > 1 ? 's' : ''}';
    } else if (difference.inMinutes > 0) {
      return 'Il y a ${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''}';
    } else {
      return 'À l\'instant';
    }
  }

  String _formatTimeUntil(DateTime dateTime) {
    final Duration difference = dateTime.difference(DateTime.now());

    if (difference.inDays > 0) {
      return 'Dans ${difference.inDays} jour${difference.inDays > 1 ? 's' : ''}';
    } else if (difference.inHours > 0) {
      return 'Dans ${difference.inHours} heure${difference.inHours > 1 ? 's' : ''}';
    } else if (difference.inMinutes > 0) {
      return 'Dans ${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''}';
    } else {
      return 'Maintenant';
    }
  }

  IconData _getFileIcon(String type) {
    switch (type.toLowerCase()) {
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'docx':
      case 'doc':
        return Icons.description;
      case 'zip':
      case 'rar':
        return Icons.archive;
      case 'mp4':
      case 'avi':
        return Icons.video_file;
      case 'pptx':
      case 'ppt':
        return Icons.slideshow;
      default:
        return Icons.insert_drive_file;
    }
  }

  Color _getFileColor(String type) {
    switch (type.toLowerCase()) {
      case 'pdf':
        return Colors.red;
      case 'docx':
      case 'doc':
        return Colors.blue;
      case 'zip':
      case 'rar':
        return Colors.orange;
      case 'mp4':
      case 'avi':
        return Colors.purple;
      case 'pptx':
      case 'ppt':
        return Colors.amber;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: NestedScrollView(
        headerSliverBuilder: (BuildContext context, bool innerBoxIsScrolled) {
          return [
            // App Bar avec informations du cours
            SliverAppBar(
              expandedHeight: 200,
              floating: false,
              pinned: true,
              backgroundColor: widget.course['color'],
              leading: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.share, color: Colors.white),
                  onPressed: () {
                    // Partager le cours
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.more_vert, color: Colors.white),
                  onPressed: () {
                    // Menu options
                  },
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        widget.course['color'],
                        widget.course['color'].withOpacity(0.8),
                      ],
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 80, 16, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          widget.course['name'],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          // widget.course['code'],
                          'code',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(
                              Icons.person,
                              color: Colors.white70,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              // widget.course['professor'],
                              'professor',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(width: 16),
                            const Icon(
                              Icons.people,
                              color: Colors.white70,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            // Text(
                            //   '${widget.course['students']} étudiants',
                            //   style: const TextStyle(
                            //     color: Colors.white70,
                            //     fontSize: 14,
                            //   ),
                            // ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Barre d'onglets
            SliverPersistentHeader(
              pinned: true,
              delegate: _SliverTabBarDelegate(
                TabBar(
                  controller: _tabController, // Ajout du controller
                  labelColor: widget.course['color'],
                  unselectedLabelColor: Colors.grey[600],
                  indicatorColor: widget.course['color'],
                  tabs: const [
                    Tab(text: 'Fichiers'),
                    Tab(text: 'Devoirs'),
                    Tab(text: 'Annonces'),
                  ],
                ),
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController, // Ajout du controller
          children: [
            // Onglet Fichiers
            _buildFilesTab(),
            // Onglet Devoirs
            _buildAssignmentsTab(),
            // Onglet Annonces
            _buildAnnouncementsTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildFilesTab() {
    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  Icons.cloud_download,
                  color: widget.course['color'],
                  size: 20,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Derniers Uploads',
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
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final upload = _recentUploads[index];
              return _buildUploadCard(upload);
            },
            childCount: _recentUploads.length,
          ),
        ),
        const SliverToBoxAdapter(
          child: SizedBox(height: 80),
        ),
      ],
    );
  }

  Widget _buildAssignmentsTab() {
    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
        child: Container(
          width: double.infinity,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Icon(
                        Icons.assignment,
                        color: widget.course['color'],
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Devoirs et Évaluations',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ),
                if (widget.isProfessor) ...[
                  InkWell(
                    onTap: () async {
                      // Naviguer vers la page de création de devoir
                      final result = await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => CreateAssignmentPage(
                            course: widget.course,
                            token: widget.token,
                            classroomId: widget.course['id_classroom'] ?? 'classroom_id', 
                            professorId: 'professor_id', 
                          ),
                        ),
                      );
                      
                      // Si un devoir a été créé avec succès, actualiser la liste
                      if (result == true) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Devoir créé avec succès'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: widget.course['color'].withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: widget.course['color'].withOpacity(0.3),
                        ),
                      ),
                      child: Icon(
                        Icons.add,
                        color: widget.course['color'],
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final assignment = _assignments[index];
              return _buildAssignmentCard(assignment);
            },
            childCount: _assignments.length,
          ),
        ),
        const SliverToBoxAdapter(
          child: SizedBox(height: 80),
        ),
      ],
    );
  }

  Widget _buildAnnouncementsTab() {
    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  Icons.campaign,
                  color: widget.course['color'],
                  size: 20,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Annonces du Cours',
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
        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final announcement = _announcements[index];
              return _buildAnnouncementCard(announcement);
            },
            childCount: _announcements.length,
          ),
        ),
        const SliverToBoxAdapter(
          child: SizedBox(height: 80),
        ),
      ],
    );
  }

  Widget _buildUploadCard(Map<String, dynamic> upload) {
    final Color fileColor = _getFileColor(upload['type']);
    final IconData fileIcon = _getFileIcon(upload['type']);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 2,
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: InkWell(
          onTap: () {
            // Télécharger ou ouvrir le fichier
            _showDownloadDialog(upload);
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: fileColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: fileColor.withOpacity(0.3),
                      width: 2,
                    ),
                  ),
                  child: Icon(
                    fileIcon,
                    color: fileColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        upload['title'],
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        upload['description'],
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[600],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            Icons.access_time,
                            size: 14,
                            color: Colors.grey[500],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _formatTimeAgo(upload['uploadDate']),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                          const SizedBox(width: 16),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  children: [
                    Icon(
                      Icons.download,
                      color: widget.course['color'],
                      size: 24,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAssignmentCard(Map<String, dynamic> assignment) {
    final bool isOverdue = assignment['dueDate'].isBefore(DateTime.now()) &&
        !assignment['submitted'];
    final bool isSubmitted = assignment['submitted'];

    Color statusColor = Colors.orange;
    if (isSubmitted) {
      statusColor = Colors.green;
    } else if (isOverdue) {
      statusColor = Colors.red;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 2,
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: InkWell(
          onTap: () {
            // Naviguer vers la page de soumission du devoir
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => AssignmentSubmissionPage(
                  assignment: assignment,
                  course: widget.course,
                  token: widget.token,
                ),
              ),
            );
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        assignment['title'],
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: statusColor.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        assignment['status'],
                        style: TextStyle(
                          fontSize: 12,
                          color: statusColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 16,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isSubmitted
                          ? 'Rendu ${_formatTimeAgo(assignment['dueDate'])}'
                          : _formatTimeUntil(assignment['dueDate']),
                      style: TextStyle(
                        fontSize: 14,
                        color: isOverdue ? Colors.red : Colors.grey[600],
                        fontWeight:
                            isOverdue ? FontWeight.w500 : FontWeight.normal,
                      ),
                    ),
                    const Spacer(),
                    // Icon(
                    //   Icons.star,
                    //   size: 16,
                    //   color: Colors.amber,
                    // ),
                    // const SizedBox(width: 4),
                    // Text(
                    //   '${assignment['points']} points',
                    //   style: TextStyle(
                    //     fontSize: 14,
                    //     color: Colors.grey[600],
                    //   ),
                    // ),
                  ],
                ),
                // if (assignment.containsKey('grade'))
                //   Padding(
                //     padding: const EdgeInsets.only(top: 8),
                //     child: Container(
                //       padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                //       decoration: BoxDecoration(
                //         color: Colors.green[50],
                //         borderRadius: BorderRadius.circular(8),
                //         border: Border.all(
                //           color: Colors.green[200]!,
                //           width: 1,
                //         ),
                //       ),
                //       // child: Text(
                //       //   'Note: ${assignment['grade']}/${assignment['points']}',
                //       //   style: TextStyle(
                //       //     fontSize: 12,
                //       //     color: Colors.green[700],
                //       //     fontWeight: FontWeight.bold,
                //       //   ),
                //       // ),
                //     ),
                //   ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAnnouncementCard(Map<String, dynamic> announcement) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: announcement['important'] ? 3 : 1,
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: announcement['important']
              ? BorderSide(color: Colors.red.withOpacity(0.3), width: 1)
              : BorderSide.none,
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (announcement['important'])
                    Icon(
                      Icons.priority_high,
                      color: Colors.red,
                      size: 20,
                    ),
                  if (announcement['important']) const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      announcement['title'],
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: announcement['important']
                            ? Colors.red[700]
                            : Colors.black87,
                      ),
                    ),
                  ),
                  Text(
                    _formatTimeAgo(announcement['timestamp']),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[500],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                announcement['content'],
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDownloadDialog(Map<String, dynamic> upload) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Télécharger ${upload['title']}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Taille: ${upload['size']}'),
              const SizedBox(height: 8),
              Text('Description: ${upload['description']}'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                // Logique de téléchargement ici
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content:
                        Text('Téléchargement de ${upload['title']} commencé'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
              child: const Text('Télécharger'),
            ),
          ],
        );
      },
    );
  }
}

// Delegate pour la barre d'onglets persistante
class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;

  _SliverTabBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Colors.white,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) {
    return false;
  }
}
