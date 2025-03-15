import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { apiRequest } from '@/lib/queryClient';

interface CommentData {
  id: number;
  userId: number;
  videoId: number;
  parentId: number | null;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  username?: string;
  profilePicture?: string | null;
  name?: string | null;
  replies?: CommentData[];
}

interface CommentSectionProps {
  videoId: number;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { user, isLoading, checkAuth } = useAuth();
  const { toast } = useToast();
  
  // Cargar comentarios
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<{comments: CommentData[], count: number}>(
          `/api/videos/${videoId}/comments`
        );
        
        if (response) {
          setComments(response.comments);
          setCommentCount(response.count);
        }
      } catch (error) {
        console.error('Error al cargar comentarios:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los comentarios.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [videoId, toast]);
  
  // Enviar un nuevo comentario
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAuth()) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para comentar.',
        variant: 'default'
      });
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await apiRequest<CommentData>(
        `/api/videos/${videoId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ content: newComment })
        }
      );
      
      if (response) {
        setComments(prev => [response, ...prev]);
        setCommentCount(prev => prev + 1);
        setNewComment('');
        toast({
          title: 'Comentario publicado',
          description: 'Tu comentario ha sido publicado exitosamente.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      toast({
        title: 'Error',
        description: 'No se pudo publicar el comentario.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Enviar una respuesta a un comentario
  const handleSubmitReply = async (parentId: number) => {
    if (!checkAuth()) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para responder.',
        variant: 'default'
      });
      return;
    }
    
    if (!replyContent.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await apiRequest<CommentData>(
        `/api/videos/${videoId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ 
            content: replyContent,
            parentId 
          })
        }
      );
      
      if (response) {
        // Actualizar el comentario padre con la nueva respuesta
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response]
            };
          }
          return comment;
        }));
        
        setReplyingTo(null);
        setReplyContent('');
        setCommentCount(prev => prev + 1);
        
        toast({
          title: 'Respuesta publicada',
          description: 'Tu respuesta ha sido publicada exitosamente.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error al publicar respuesta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo publicar la respuesta.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Editar un comentario
  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await apiRequest<CommentData>(
        `/api/comments/${commentId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ content: editContent })
        }
      );
      
      if (response) {
        // Actualizar el comentario en la lista
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: editContent,
              isEdited: true
            };
          } else if (comment.replies) {
            // Buscar en las respuestas
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId 
                  ? { ...reply, content: editContent, isEdited: true } 
                  : reply
              )
            };
          }
          return comment;
        }));
        
        setEditingComment(null);
        setEditContent('');
        
        toast({
          title: 'Comentario actualizado',
          description: 'Tu comentario ha sido actualizado exitosamente.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error al editar comentario:', error);
      toast({
        title: 'Error',
        description: 'No se pudo editar el comentario.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Eliminar un comentario
  const handleDeleteComment = async (commentId: number, isReply: boolean, parentId?: number) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este comentario?");
    if (!confirmDelete) return;
    
    try {
      await apiRequest(
        `/api/comments/${commentId}`,
        {
          method: 'DELETE'
        }
      );
      
      if (isReply && parentId) {
        // Si es una respuesta, la quitamos del comentario padre
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: (comment.replies || []).filter(reply => reply.id !== commentId)
            };
          }
          return comment;
        }));
      } else {
        // Si es un comentario principal, lo quitamos de la lista
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
      
      setCommentCount(prev => prev - 1);
      
      toast({
        title: 'Comentario eliminado',
        description: 'El comentario ha sido eliminado exitosamente.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el comentario.',
        variant: 'destructive'
      });
    }
  };
  
  // Like/unlike un comentario
  const handleLikeComment = async (commentId: number, liked: boolean, isReply: boolean, parentId?: number) => {
    if (!checkAuth()) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para dar like.',
        variant: 'default'
      });
      return;
    }
    
    try {
      await apiRequest(
        `/api/comments/${commentId}/${liked ? 'unlike' : 'like'}`,
        {
          method: 'POST'
        }
      );
      
      // Actualizar el estado del comentario
      if (isReply && parentId) {
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: (comment.replies || []).map(reply => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    likes: liked ? reply.likes - 1 : reply.likes + 1
                  };
                }
                return reply;
              })
            };
          }
          return comment;
        }));
      } else {
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: liked ? comment.likes - 1 : comment.likes + 1
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error al dar like/unlike:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar la acción.',
        variant: 'destructive'
      });
    }
  };

  // Formatear fecha para mostrarla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Obtener iniciales del nombre de usuario para el avatar
  const getInitials = (username: string, name: string | null) => {
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return username[0].toUpperCase();
  };
  
  return (
    <div className="mt-8 mb-6">
      <h3 className="text-xl font-bold mb-4">Comentarios ({commentCount})</h3>
      
      {/* Formulario para nuevo comentario */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
              <AvatarFallback>{getInitials(user.username, user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Añade un comentario..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="mb-2"
                rows={3}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || submitting}
                >
                  Comentar
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
      
      {!user && (
        <div className="bg-muted p-4 rounded-md mb-6">
          <p className="text-center">
            <a href="/login" className="text-primary font-medium">Inicia sesión</a> para dejar un comentario
          </p>
        </div>
      )}
      
      {/* Lista de comentarios */}
      {loading ? (
        <div className="text-center p-4">
          <p>Cargando comentarios...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center p-4 bg-muted rounded-md">
          <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="border-b pb-4">
              {/* Comentario principal */}
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.profilePicture || undefined} alt={comment.username || 'Usuario'} />
                  <AvatarFallback>
                    {comment.username ? getInitials(comment.username, comment.name || null) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{comment.username || 'Usuario'}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                      {comment.isEdited && " (editado)"}
                    </span>
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="mt-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="mb-2"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent('');
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={() => handleEditComment(comment.id)}
                          disabled={!editContent.trim() || submitting}
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1">{comment.content}</p>
                  )}
                  
                  {/* Acciones del comentario */}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <button 
                      onClick={() => handleLikeComment(comment.id, false, false)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <span>❤️</span> {comment.likes}
                    </button>
                    
                    {user && (
                      <button
                        onClick={() => {
                          setReplyingTo(comment.id);
                          setReplyContent('');
                        }}
                        className="text-muted-foreground hover:text-primary"
                      >
                        Responder
                      </button>
                    )}
                    
                    {user && (user.id === comment.userId || user.role === 'admin') && (
                      <>
                        <button
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="text-muted-foreground hover:text-primary"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id, false)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Formulario de respuesta */}
                  {replyingTo === comment.id && (
                    <div className="mt-4">
                      <Textarea
                        placeholder="Escribe tu respuesta..."
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        className="mb-2"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim() || submitting}
                        >
                          Responder
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Respuestas */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-14 mt-4 space-y-4">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={reply.profilePicture || undefined} alt={reply.username || 'Usuario'} />
                        <AvatarFallback>
                          {reply.username ? getInitials(reply.username, reply.name || null) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-sm">{reply.username || 'Usuario'}</h5>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(reply.createdAt)}
                            {reply.isEdited && " (editado)"}
                          </span>
                        </div>
                        
                        {editingComment === reply.id ? (
                          <div className="mt-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="mb-2"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditContent('');
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(reply.id)}
                                disabled={!editContent.trim() || submitting}
                              >
                                Guardar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 text-sm">{reply.content}</p>
                        )}
                        
                        {/* Acciones de la respuesta */}
                        <div className="flex items-center gap-4 mt-1 text-xs">
                          <button 
                            onClick={() => handleLikeComment(reply.id, false, true, comment.id)}
                            className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                          >
                            <span>❤️</span> {reply.likes}
                          </button>
                          
                          {user && (user.id === reply.userId || user.role === 'admin') && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingComment(reply.id);
                                  setEditContent(reply.content);
                                }}
                                className="text-muted-foreground hover:text-primary"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}