export const isLoggedIn = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const requireAuth = (history: any, redirectPath: string = '/login') => {
  if (!isLoggedIn()) {
    history.push(redirectPath);
    return false;
  }
  return true;
};