import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';

class AssignmentSubmissionPage extends StatefulWidget {
  final Map<String, dynamic> assignment;
  final Map<dynamic, dynamic> course;
  final String token;

  const AssignmentSubmissionPage({
    super.key,
    required this.assignment,
    required this.course,
    required this.token,
  });

  @override
  State<AssignmentSubmissionPage> createState() => _AssignmentSubmissionPageState();
}

class _AssignmentSubmissionPageState extends State<AssignmentSubmissionPage> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  
  final TextEditingController _commentController = TextEditingController();
  final List<Map<String, dynamic>> _uploadedFiles = [];
  bool _isSubmitting = false;
  bool _isUploading = false;

  // Détails étendus du devoir (simulés)
  late Map<String, dynamic> _assignmentDetails;

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

    // Initialiser les détails du devoir avec des données étendues
    _assignmentDetails = {
      ...widget.assignment,
      'description': 'Développez une application complète en utilisant les concepts de programmation orientée objet. L\'application doit inclure au moins 3 classes avec héritage, polymorphisme et encapsulation. Documentez votre code et fournissez un rapport explicatif.',
      'requirements': [
        'Code source complet',
        'Documentation technique',
        'Rapport d\'analyse (PDF)',
        'Diagramme UML des classes',
      ],
      'acceptedFormats': ['java', 'py', 'cpp', 'pdf', 'docx', 'zip', 'rar'],
      'maxFileSize': '50 MB',
      'maxFiles': 5,
      'instructions': 'Compressez tous vos fichiers dans une archive ZIP. Nommez vos fichiers clairement. Le rapport doit faire entre 5 et 10 pages.',
    };
  }

  @override
  void dispose() {
    _animationController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  String _formatTimeUntil(DateTime dateTime) {
    final Duration difference = dateTime.difference(DateTime.now());
    
    if (difference.inDays > 0) {
      return '${difference.inDays} jour${difference.inDays > 1 ? 's' : ''} restant${difference.inDays > 1 ? 's' : ''}';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} heure${difference.inHours > 1 ? 's' : ''} restante${difference.inHours > 1 ? 's' : ''}';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} restante${difference.inMinutes > 1 ? 's' : ''}';
    } else {
      return 'Échéance dépassée';
    }
  }

  String _getFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  IconData _getFileIcon(String extension) {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'doc':
      case 'docx':
        return Icons.description;
      case 'zip':
      case 'rar':
        return Icons.archive;
      case 'java':
      case 'py':
      case 'cpp':
      case 'js':
        return Icons.code;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return Icons.image;
      default:
        return Icons.insert_drive_file;
    }
  }

  Color _getFileColor(String extension) {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return Colors.red;
      case 'doc':
      case 'docx':
        return Colors.blue;
      case 'zip':
      case 'rar':
        return Colors.orange;
      case 'java':
      case 'py':
      case 'cpp':
      case 'js':
        return Colors.green;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  Future<void> _pickFiles() async {
    if (_uploadedFiles.length >= _assignmentDetails['maxFiles']) {
      _showErrorSnackBar('Nombre maximum de fichiers atteint (${_assignmentDetails['maxFiles']})');
      return;
    }

    setState(() {
      _isUploading = true;
    });

    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.any,
      );

      if (result != null) {
        for (PlatformFile file in result.files) {
          if (_uploadedFiles.length >= _assignmentDetails['maxFiles']) {
            _showErrorSnackBar('Nombre maximum de fichiers atteint');
            break;
          }

          // Vérifier la taille du fichier (50 MB max)
          if (file.size > 50 * 1024 * 1024) {
            _showErrorSnackBar('Le fichier ${file.name} est trop volumineux (max 50 MB)');
            continue;
          }

          // Vérifier l'extension
          String extension = file.extension?.toLowerCase() ?? '';
          if (!_assignmentDetails['acceptedFormats'].contains(extension)) {
            _showErrorSnackBar('Format de fichier non supporté: ${file.name}');
            continue;
          }

          setState(() {
            _uploadedFiles.add({
              'id': DateTime.now().millisecondsSinceEpoch.toString(),
              'name': file.name,
              'size': file.size,
              'extension': extension,
              'path': file.path,
              'uploadDate': DateTime.now(),
            });
          });
        }
      }
    } catch (e) {
      _showErrorSnackBar('Erreur lors de la sélection des fichiers');
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  void _removeFile(String fileId) {
    setState(() {
      _uploadedFiles.removeWhere((file) => file['id'] == fileId);
    });
  }

  Future<void> _submitAssignment() async {
    if (_uploadedFiles.isEmpty) {
      _showErrorSnackBar('Veuillez ajouter au moins un fichier');
      return;
    }

    // Vérifier si l'échéance est dépassée
    if (_assignmentDetails['dueDate'].isBefore(DateTime.now())) {
      bool? confirm = await _showConfirmDialog(
        'Échéance dépassée',
        'L\'échéance de ce devoir est dépassée. Voulez-vous quand même soumettre ?',
      );
      if (confirm != true) return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      // Simuler l'upload et la soumission
      await Future.delayed(const Duration(seconds: 3));

      // Afficher le succès
      _showSuccessDialog();
    } catch (e) {
      _showErrorSnackBar('Erreur lors de la soumission');
    } finally {
      setState(() {
        _isSubmitting = false;
      });
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

  Future<bool?> _showConfirmDialog(String title, String content) {
    return showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(title),
          content: Text(content),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Confirmer'),
            ),
          ],
        );
      },
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Row(
            children: [
              Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 28,
              ),
              const SizedBox(width: 8),
              const Text('Soumission réussie'),
            ],
          ),
          content: const Text(
            'Votre devoir a été soumis avec succès. Vous recevrez une confirmation par email.',
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Fermer le dialog
                Navigator.of(context).pop(); // Retourner à la page précédente
              },
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isOverdue = _assignmentDetails['dueDate'].isBefore(DateTime.now());
    final bool isSubmitted = _assignmentDetails['submitted'] ?? false;

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        title: const Text(
          'Soumettre le devoir',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: FadeTransition(
        opacity: _animation,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // En-tête du devoir
            SliverToBoxAdapter(
              child: _buildAssignmentHeader(isOverdue, isSubmitted),
            ),

            // Détails du devoir
            SliverToBoxAdapter(
              child: _buildAssignmentDetails(),
            ),

            // Section d'upload
            if (!isSubmitted) ...[
              SliverToBoxAdapter(
                child: _buildUploadSection(),
              ),

              // Liste des fichiers uploadés
              if (_uploadedFiles.isNotEmpty)
                SliverToBoxAdapter(
                  child: _buildUploadedFilesList(),
                ),

              // Section commentaires
              SliverToBoxAdapter(
                child: _buildCommentsSection(),
              ),

              // Bouton de soumission
              SliverToBoxAdapter(
                child: _buildSubmissionButton(isOverdue),
              ),
            ] else ...[
              // Affichage pour devoir déjà soumis
              SliverToBoxAdapter(
                child: _buildSubmittedView(),
              ),
            ],

            // Espace en bas
            const SliverToBoxAdapter(
              child: SizedBox(height: 80),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAssignmentHeader(bool isOverdue, bool isSubmitted) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            widget.course['color'],
            widget.course['color'].withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: widget.course['color'].withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _assignmentDetails['title'],
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            widget.course['name'],
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Icon(
                isOverdue ? Icons.warning : Icons.access_time,
                color: isOverdue ? Colors.red[300] : Colors.white70,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                _formatTimeUntil(_assignmentDetails['dueDate']),
                style: TextStyle(
                  color: isOverdue ? Colors.red[300] : Colors.white70,
                  fontSize: 14,
                  fontWeight: isOverdue ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.star,
                      color: Colors.white,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${_assignmentDetails['points']} points',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAssignmentDetails() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
    );
  }

  Widget _buildUploadSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Fichiers à soumettre',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _isUploading ? null : _pickFiles,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                border: Border.all(
                  color: widget.course['color'].withOpacity(0.3),
                  width: 2,
                  style: BorderStyle.solid,
                ),
                borderRadius: BorderRadius.circular(12),
                color: widget.course['color'].withOpacity(0.05),
              ),
              child: Column(
                children: [
                  if (_isUploading)
                    CircularProgressIndicator(
                      color: widget.course['color'],
                    )
                  else
                    Icon(
                      Icons.cloud_upload,
                      size: 48,
                      color: widget.course['color'],
                    ),
                  const SizedBox(height: 12),
                  Text(
                    _isUploading ? 'Upload en cours...' : 'Cliquez pour ajouter des fichiers',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: widget.course['color'],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Formats acceptés: ${_assignmentDetails['acceptedFormats'].join(', ').toUpperCase()}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Taille max: ${_assignmentDetails['maxFileSize']} • Max ${_assignmentDetails['maxFiles']} fichiers',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUploadedFilesList() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'Fichiers sélectionnés',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const Spacer(),
              Text(
                '${_uploadedFiles.length}/${_assignmentDetails['maxFiles']}',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...(_uploadedFiles.map((file) => _buildFileItem(file))),
        ],
      ),
    );
  }

  Widget _buildFileItem(Map<String, dynamic> file) {
    final Color fileColor = _getFileColor(file['extension']);
    final IconData fileIcon = _getFileIcon(file['extension']);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Colors.grey[200]!,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: fileColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: fileColor.withOpacity(0.3),
                width: 1,
              ),
            ),
            child: Icon(
              fileIcon,
              color: fileColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  file['name'],
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  _getFileSize(file['size']),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _removeFile(file['id']),
            icon: Icon(
              Icons.delete_outline,
              color: Colors.red[400],
              size: 20,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommentsSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Commentaires (optionnel)',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _commentController,
            maxLines: 4,
            decoration: InputDecoration(
              hintText: 'Ajoutez des commentaires ou des notes pour votre professeur...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: widget.course['color']),
              ),
              contentPadding: const EdgeInsets.all(12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmissionButton(bool isOverdue) {
    return Container(
      margin: const EdgeInsets.all(16),
      child: SizedBox(
        width: double.infinity,
        height: 50,
        child: ElevatedButton(
          onPressed: _isSubmitting ? null : _submitAssignment,
          style: ElevatedButton.styleFrom(
            backgroundColor: isOverdue ? Colors.orange : widget.course['color'],
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: _isSubmitting
              ? const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    ),
                    SizedBox(width: 12),
                    Text('Soumission en cours...'),
                  ],
                )
              : Text(
                  isOverdue ? 'Soumettre en retard' : 'Soumettre le devoir',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildSubmittedView() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.green[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.green[200]!,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.check_circle,
            color: Colors.green[600],
            size: 48,
          ),
          const SizedBox(height: 12),
          Text(
            'Devoir déjà soumis',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.green[700],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Vous avez déjà soumis ce devoir. Consultez vos notes dans la section des résultats.',
            style: TextStyle(
              fontSize: 14,
              color: Colors.green[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}