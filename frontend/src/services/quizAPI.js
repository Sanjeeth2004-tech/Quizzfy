export const submitQuiz = async (courseId, answers, timeSpent) => {
  try {
    const userEmail = localStorage.getItem('userEmail');
    const userPassword = localStorage.getItem('userPassword');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!userEmail || !userPassword || !user) {
      throw new Error('User credentials not found');
    }
    
    // Make sure courseId is properly encoded
    const encodedCourseId = encodeURIComponent(courseId);
    
    const response = await api.post(`/courses/${encodedCourseId}/submit`, {
      answers,
      timeSpent,
      userId: user.id
    });
    
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
}; 