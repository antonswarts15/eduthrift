import { useHistory } from 'react-router-dom';
import { buildCategoryPath, CategoryRoute } from '../utils/routeUtils';

export const useNavigation = () => {
  const history = useHistory();

  const navigateToCategory = (route: CategoryRoute) => {
    const path = buildCategoryPath(route);
    history.push(path);
  };

  const navigateToItem = (category: string, subcategory: string, item: string, sport?: string) => {
    const route: CategoryRoute = { category, subcategory, item, sport };
    const path = buildCategoryPath(route);
    history.push(path);
  };

  const goBack = () => {
    history.goBack();
  };

  const goHome = () => {
    history.push('/home');
  };

  return {
    navigateToCategory,
    navigateToItem,
    goBack,
    goHome,
    history
  };
};