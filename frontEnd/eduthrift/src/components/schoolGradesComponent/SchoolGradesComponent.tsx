import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonAccordion,
  IonAccordionGroup,
  IonToast,
  IonBadge
} from '@ionic/react';
import {
  libraryOutline,
  schoolOutline,
  languageOutline,
  calculatorOutline,
  flaskOutline,
  globeOutline,
  brushOutline,
  fitnessOutline,
  businessOutline,
  constructOutline,
  peopleOutline,
  cameraOutline,
  heartOutline,
  hammerOutline,
  ellipsisHorizontalOutline,
  happyOutline,
  rocketOutline,
  starOutline,
  trophyOutline,
  diamondOutline,
  checkmarkCircle,
  listOutline
} from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore, Listing } from '../../stores/listingsStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useHistory } from 'react-router-dom';


interface SchoolGradesComponentProps {
  onCategorySelect?: (phase: string, subject: string) => void;
  userType?: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
}

const SchoolGradesComponent: React.FC<SchoolGradesComponentProps> = ({
  userType = 'seller',
  onItemSelect
}) => {
  const history = useHistory();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [viewingBook, setViewingBook] = useState<any>(null);
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [selectedContext, setSelectedContext] = useState<{grade: string, subject: string, language?: string} | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<string>('danger');
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessConfirmation, setShowSuccessConfirmation] = useState(false);
  const [submittedBook, setSubmittedBook] = useState<any>(null);
  const { addToCart } = useCartStore();
  const { addListing, listings, fetchListings } = useListingsStore();
  const { addNotification } = useNotificationStore();
  const { checkForMatches } = useWishlistStore();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);

  const grades = [
    'Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ];

  const gradeSubjects = {
    'Grade R': ['Life Skills', 'Language & Literacy', 'Numeracy', 'Creative Arts'],
    'Grade 1': ['Mathematics', 'English Home Language', 'Afrikaans Home Language', 'Life Skills'],
    'Grade 2': ['Mathematics', 'English Home Language', 'Afrikaans Home Language', 'Life Skills'],
    'Grade 3': ['Mathematics', 'English Home Language', 'Afrikaans Home Language', 'Life Skills'],
    'Grade 4': ['Mathematics', 'English Home Language', 'Afrikaans Home Language', 'Natural Sciences & Technology', 'Social Sciences'],
    'Grade 5': ['Mathematics', 'English Home Language', 'Afrikaans Home Language', 'Natural Sciences & Technology', 'Social Sciences'],
    'Grade 6': ['Mathematics', 'English Home Language', 'Afrikaans Home Language', 'Natural Sciences & Technology', 'Social Sciences'],
    'Grade 7': ['Mathematics', 'English Home Language', 'Afrikaans Home Language', 'Natural Sciences', 'Social Sciences', 'Life Orientation', 'Technology', 'Economic & Management Sciences'],
    'Grade 8': ['Mathematics', 'English Home Language', 'Afrikaans Home Language', 'Natural Sciences', 'Social Sciences', 'Life Orientation', 'Technology', 'Economic & Management Sciences'],
    'Grade 9': ['Mathematics', 'English Home Language', 'Afrikaans Home Language', 'Natural Sciences', 'Social Sciences', 'Life Orientation', 'Technology', 'Economic & Management Sciences'],
    'Grade 10': ['Mathematics', 'Mathematical Literacy', 'English Home Language', 'English First Additional Language', 'Afrikaans Home Language', 'Afrikaans First Additional Language', 'Physical Sciences', 'Life Sciences', 'Geography', 'History', 'Life Orientation', 'Accounting', 'Business Studies', 'Economics', 'Information Technology', 'Consumer Studies', 'Tourism', 'Agricultural Sciences'],
    'Grade 11': ['Mathematics', 'Mathematical Literacy', 'English Home Language', 'English First Additional Language', 'Afrikaans Home Language', 'Afrikaans First Additional Language', 'Physical Sciences', 'Life Sciences', 'Geography', 'History', 'Life Orientation', 'Accounting', 'Business Studies', 'Economics', 'Information Technology', 'Consumer Studies', 'Tourism', 'Agricultural Sciences'],
    'Grade 12': ['Mathematics', 'Mathematical Literacy', 'English Home Language', 'English First Additional Language', 'Afrikaans Home Language', 'Afrikaans First Additional Language', 'Physical Sciences', 'Life Sciences', 'Geography', 'History', 'Life Orientation', 'Accounting', 'Business Studies', 'Economics', 'Information Technology', 'Consumer Studies', 'Tourism', 'Agricultural Sciences']
  };

  const getLanguagesForSubject = (subject: string) => {
    const multiLanguageSubjects = ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Geography', 'History', 'Accounting', 'Business Studies', 'Economics', 'Language & Literacy'];
    if (multiLanguageSubjects.includes(subject)) {
      return ['English', 'Afrikaans'];
    }
    return [];
  };

  const getFilteredBooks = (grade: string, subject: string, language?: string) => {
    return listings.filter(listing => {
      if (listing.category !== 'Textbooks') return false;
      if (listing.subcategory !== grade) return false;
      // We use 'sport' field to store the Subject for textbooks
      if (listing.sport !== subject) return false;
      // We use 'size' field to store the Language for textbooks (if applicable)
      if (language && listing.size !== language) return false;
      return true;
    }).map(listing => ({
      ...listing,
      title: listing.name,
      // Extract author/publisher from description if possible, or just use description
      author: 'Unknown', // Placeholder as we don't store author separately yet
      publisher: 'Unknown',
      grade: listing.subcategory,
      subject: listing.sport,
      language: listing.size
    }));
  };

  const handleAddToCart = (book: any) => {
    if (book.quantity === 0) {
      setToastMessage(`${book.title} is sold out!`);
      setShowToast(true);
      return;
    }

    const cartItem = {
      id: book.id,
      name: book.title,
      description: book.description,
      price: book.price,
      condition: book.condition,
      school: '',
      size: book.size,
      gender: book.gender,
      frontPhoto: book.frontPhoto,
      backPhoto: book.backPhoto,
      category: 'Textbooks',
      subcategory: book.grade,
      sport: book.subject,
      quantity: 1
    };

    addToCart(cartItem);
    setAddedToCartId(book.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const handleSubmit = async () => {
    if (!selectedContext) return;

    // Validate required fields
    const missingFields = [];
    if (!title && !selectedContext.subject) missingFields.push('Textbook Title');
    if (!condition) missingFields.push('Condition Grade');
    if (userType === 'seller' && !price) missingFields.push('Price');
    if (userType === 'seller' && !frontPhoto) missingFields.push('Front Photo');
    if (userType === 'seller' && !backPhoto) missingFields.push('Back Photo');

    if (missingFields.length > 0) {
      setToastMessage(`Please fill in: ${missingFields.join(', ')}`);
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    const bookTitle = title || `${selectedContext.subject} ${selectedContext.grade}`;
    const bookData = {
      title: bookTitle,
      author,
      publisher,
      isbn,
      grade: selectedContext.grade,
      subject: selectedContext.subject,
      language: selectedContext.language,
      condition,
      price,
      frontPhoto,
      backPhoto
    };

    if (userType === 'seller') {
      setIsSubmitting(true);
      try {
        const listingData = {
          id: Date.now().toString(),
          name: bookTitle,
          description: [
            `${bookTitle} by ${author || 'Unknown'}`,
            publisher ? `Publisher: ${publisher}` : '',
            isbn ? `ISBN: ${isbn}` : '',
            `${selectedContext.grade} - ${selectedContext.subject}`,
            selectedContext.language ? `Language: ${selectedContext.language}` : ''
          ].filter(Boolean).join('. '),
          price: parseInt(price),
          condition: condition!,
          school: '',
          // Store Language in 'size' field
          size: selectedContext.language || 'Standard',
          gender: 'Unisex',
          category: 'Textbooks',
          subcategory: selectedContext.grade,
          // Store Subject in 'sport' field
          sport: selectedContext.subject,
          frontPhoto: frontPhoto || '',
          backPhoto: backPhoto || '',
          dateCreated: new Date().toLocaleDateString(),
          quantity: 1,
          soldOut: false,
          verificationStatus: 'pending' as const
        };

        await addListing(listingData, (newListing) => checkForMatches(newListing, addNotification));
        addNotification('Textbook Listed', `${bookTitle} has been listed for R${price}`);
        setSubmittedBook({ ...bookData, price: parseInt(price) });
        setShowBookDetails(false);
        setShowSuccessConfirmation(true);
      } catch (error: any) {
        setToastMessage(error.message || 'Failed to list textbook. Please try again.');
        setToastColor('danger');
        setShowToast(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onItemSelect?.(bookData);
      setShowBookDetails(false);
      setSelectedContext(null);
      setSelectedGrade('');
      setExpandedCategory(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setPublisher('');
    setIsbn('');
    setCondition(undefined);
    setPrice('');
    setFrontPhoto(null);
    setBackPhoto(null);
  };

  const handlePhotoUpload = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (type === 'front') {
            setFrontPhoto(event.target?.result as string);
          } else {
            setBackPhoto(event.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const renderPhotoViewer = () => {
    if (!photoViewer) return null;
    
    return createPortal(
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => setPhotoViewer(null)}
      >
        <div 
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '90%',
            maxHeight: '90%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              zIndex: 10
            }}
            onClick={() => setPhotoViewer(null)}
          >
            ×
          </button>
          <img 
            src={photoViewer}
            alt="Zoomed view"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid #ddd',
              touchAction: 'pinch-zoom'
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          />
        </div>
      </div>,
      document.body
    );
  };

  if (showSuccessConfirmation && submittedBook) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <IonIcon icon={checkmarkCircle} style={{ fontSize: '64px', color: '#28a745' }} />
          <h3 style={{ color: '#155724', margin: '12px 0 8px' }}>Textbook Listed Successfully!</h3>
          <p style={{ color: '#155724', margin: 0 }}>
            Your <strong>{submittedBook.title}</strong> has been listed for <strong>R{submittedBook.price}</strong>.
          </p>
        </div>

        <IonCard>
          <IonCardContent>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
              {submittedBook.frontPhoto && (
                <img src={submittedBook.frontPhoto} alt="Front" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
              )}
              {submittedBook.backPhoto && (
                <img src={submittedBook.backPhoto} alt="Back" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
              )}
            </div>
            <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>{submittedBook.title}</strong></p>
            {submittedBook.author && <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>by {submittedBook.author}</p>}
            {submittedBook.publisher && <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>Publisher: {submittedBook.publisher}</p>}
            {submittedBook.isbn && <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>ISBN: {submittedBook.isbn}</p>}
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>{submittedBook.grade} - {submittedBook.subject}</p>
          </IonCardContent>
        </IonCard>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          <IonButton fill="outline" onClick={() => {
            setShowSuccessConfirmation(false);
            setSubmittedBook(null);
            setSelectedContext(null);
            setSelectedGrade('');
            setExpandedCategory(null);
            resetForm();
          }}>
            List Another Textbook
          </IonButton>
          <IonButton onClick={() => history.push('/profile/listings')}>
            <IonIcon icon={listOutline} slot="start" />
            View My Listings
          </IonButton>
        </div>
      </div>
    );
  }

  if (showBookDetails && selectedContext) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => {
          setShowBookDetails(false);
          setSelectedContext(null);
        }}>← Back</IonButton>

        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>
            {selectedContext.subject} - {selectedContext.grade}
          </span>
          {selectedContext.language && (
            <p style={{ fontSize: '14px', color: '#888', margin: '4px 0 0 0' }}>
              Language: {selectedContext.language}
            </p>
          )}
        </div>

        <IonItem>
          <IonInput 
            label="Textbook Title" 
            labelPlacement="stacked" 
            value={title} 
            onIonChange={e => setTitle(e.detail.value!)} 
            placeholder={`${selectedContext.subject} ${selectedContext.grade}`}
          />
        </IonItem>

        <IonItem>
          <IonInput 
            label="Author(s)" 
            labelPlacement="stacked" 
            value={author} 
            onIonChange={e => setAuthor(e.detail.value!)} 
            placeholder="Enter author name(s)"
          />
        </IonItem>

        <IonItem>
          <IonInput 
            label="Publisher" 
            labelPlacement="stacked" 
            value={publisher} 
            onIonChange={e => setPublisher(e.detail.value!)} 
            placeholder="Enter publisher name"
          />
        </IonItem>

        <IonItem>
          <IonInput 
            label="ISBN (Optional)" 
            labelPlacement="stacked" 
            value={isbn} 
            onIonChange={e => setIsbn(e.detail.value!)} 
            placeholder="Enter ISBN number"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Condition Grade</IonLabel>
          <IonSelect value={condition} onIonChange={e => setCondition(parseInt(e.detail.value))}>
            <IonSelectOption value={1}>1 - Brand new</IonSelectOption>
            <IonSelectOption value={2}>2 - Like new</IonSelectOption>
            <IonSelectOption value={3}>3 - Used but good</IonSelectOption>
            <IonSelectOption value={4}>4 - Used and worn</IonSelectOption>
          </IonSelect>
        </IonItem>

        {userType === 'seller' && (
          <>
            <IonItem>
              <IonInput 
                label="Price (ZAR)" 
                type="number" 
                value={price} 
                onIonChange={e => setPrice(e.detail.value!)} 
                placeholder="Enter selling price"
              />
            </IonItem>
            
            <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div 
                  onClick={() => handlePhotoUpload('front')}
                  style={{
                    width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundImage: frontPhoto ? `url(${frontPhoto})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }}
                >
                  {!frontPhoto && <IonIcon icon={cameraOutline} size="large" />}
                </div>
                <p style={{ fontSize: '12px', margin: '4px 0' }}>Front Photo</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div 
                  onClick={() => handlePhotoUpload('back')}
                  style={{
                    width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundImage: backPhoto ? `url(${backPhoto})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }}
                >
                  {!backPhoto && <IonIcon icon={cameraOutline} size="large" />}
                </div>
                <p style={{ fontSize: '12px', margin: '4px 0' }}>Back Photo</p>
              </div>
            </div>
          </>
        )}

        <IonButton expand="full" onClick={handleSubmit} disabled={isSubmitting} style={{ marginTop: '16px' }}>
          {isSubmitting ? 'Listing...' : (userType === 'seller' ? 'List Textbook' : 'Add to Cart')}
        </IonButton>
        {renderPhotoViewer()}
      </div>
    );
  }

  if (viewingBook) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => {
          setViewingBook(null);
          setSelectedContext(null);
        }}>← Back</IonButton>

        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>
            {viewingBook.title}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', margin: '16px 0', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <img
              src={viewingBook.frontPhoto}
              alt="Front view"
              onClick={() => setPhotoViewer(viewingBook.frontPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer'
              }}
            />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Front</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src={viewingBook.backPhoto}
              alt="Back view"
              onClick={() => setPhotoViewer(viewingBook.backPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer'
              }}
            />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Back</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
          <div style={{ marginBottom: '8px' }}><strong>Author:</strong> {viewingBook.author}</div>
          <div style={{ marginBottom: '8px' }}><strong>Publisher:</strong> {viewingBook.publisher}</div>
          <div style={{ marginBottom: '8px' }}><strong>Grade:</strong> {viewingBook.grade}</div>
          <div style={{ marginBottom: '8px' }}><strong>Subject:</strong> {viewingBook.subject}</div>
          {viewingBook.language && <div style={{ marginBottom: '8px' }}><strong>Language:</strong> {viewingBook.language}</div>}
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(viewingBook.condition)}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{viewingBook.price}</div>
        </div>

        <IonButton 
          expand="full" 
          onClick={() => handleAddToCart(viewingBook)}
          disabled={viewingBook.quantity === 0}
          style={{ 
            marginTop: '16px',
            '--background': addedToCartId === viewingBook.id ? '#28a745' : '',
            '--color': addedToCartId === viewingBook.id ? 'white' : ''
          }}
        >
          {viewingBook.quantity === 0 ? 'Sold Out' :
           addedToCartId === viewingBook.id ? '✓ Added to Cart!' : 'Add to Cart'}
        </IonButton>
        {renderPhotoViewer()}
      </div>
    );
  }

  const handleTextbookClick = (subject: string, language?: string) => {
    const context = { grade: selectedGrade, subject, language };
    setSelectedContext(context);
    
    const languages = getLanguagesForSubject(subject);
    if (languages.length > 0 && !language) {
      return;
    }
    
    if (userType === 'buyer') {
      const books = getFilteredBooks(selectedGrade, subject, language);
      if (books.length > 0) {
        setViewingBook(books[0]);
      } else {
        setShowBookDetails(true);
      }
    } else {
      setShowBookDetails(true);
    }
  };

  if (selectedGrade) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setSelectedGrade('')}>← Back</IonButton>
        
        {/* Prominent Grade Header */}
        <div style={{ 
          marginBottom: '20px', 
          textAlign: 'center', 
          backgroundColor: 'rgba(52, 152, 219, 0.1)', 
          border: '2px solid #3498DB', 
          borderRadius: '12px', 
          padding: '16px' 
        }}>
          <IonIcon 
            icon={schoolOutline} 
            style={{ 
              fontSize: '32px', 
              color: '#3498DB', 
              marginBottom: '8px' 
            }} 
          />
          <h2 style={{ 
            margin: '0', 
            color: '#3498DB', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            {selectedGrade}
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: '#666', 
            fontSize: '14px' 
          }}>
            Selected Grade
          </p>
        </div>
        
        <h3 style={{ margin: '16px 0', color: '#666' }}>Subject Categories</h3>
        
        {(() => {
          const subjects = gradeSubjects[selectedGrade as keyof typeof gradeSubjects] || [];
          const subjectGroups = {
            'Languages': subjects.filter(s => s.includes('Language') || s.includes('Language & Literacy')),
            'Mathematics': subjects.filter(s => s.includes('Mathematics') || s.includes('Mathematical') || s === 'Numeracy'),
            'Sciences': subjects.filter(s => s.includes('Sciences') || s.includes('Physical Sciences') || s.includes('Life Sciences') || s.includes('Natural Sciences')),
            'Social Studies': subjects.filter(s => s.includes('Social') || s === 'Geography' || s === 'History'),
            'Business & Economics': subjects.filter(s => s.includes('Business') || s.includes('Economics') || s.includes('Accounting')),
            'Life Skills & Orientation': subjects.filter(s => s.includes('Life') && !s.includes('Sciences')),
            'Creative & Technical': subjects.filter(s => s.includes('Creative') || s === 'Technology' || s.includes('Information Technology') || s.includes('Arts')),
            'Other Subjects': subjects.filter(s => 
              !s.includes('Language') && !s.includes('Mathematics') && !s.includes('Mathematical') && !s.includes('Numeracy') &&
              !s.includes('Sciences') && !s.includes('Social') && s !== 'Geography' && s !== 'History' &&
              !s.includes('Business') && !s.includes('Economics') && !s.includes('Accounting') &&
              !s.includes('Life') && !s.includes('Creative') && s !== 'Technology' && !s.includes('Information Technology') && !s.includes('Arts')
            )
          };
          
          return Object.entries(subjectGroups).map(([groupName, groupSubjects]) => {
            if (groupSubjects.length === 0) return null;
            
            const getGroupColor = (name: string) => {
              switch(name) {
                case 'Languages': return '#E74C3C';
                case 'Mathematics': return '#3498DB';
                case 'Sciences': return '#27AE60';
                case 'Social Studies': return '#F39C12';
                case 'Business & Economics': return '#8E44AD';
                case 'Life Skills & Orientation': return '#E67E22';
                case 'Creative & Technical': return '#1ABC9C';
                default: return '#95A5A6';
              }
            };
            
            const getGroupIcon = (name: string) => {
              switch(name) {
                case 'Languages': return languageOutline;
                case 'Mathematics': return calculatorOutline;
                case 'Sciences': return flaskOutline;
                case 'Social Studies': return globeOutline;
                case 'Business & Economics': return businessOutline;
                case 'Life Skills & Orientation': return heartOutline;
                case 'Creative & Technical': return hammerOutline;
                default: return ellipsisHorizontalOutline;
              }
            };
            
            const color = getGroupColor(groupName);
            const rgbColor = color.slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ');
            
            return (
              <div key={groupName} style={{ marginBottom: '16px' }}>
                <IonAccordionGroup value={expandedCategory === groupName ? groupName : undefined}>
                  <IonAccordion value={groupName}>
                    <div 
                      slot="header" 
                      style={{
                        backgroundColor: `rgba(${rgbColor}, 0.1)`,
                        border: `2px solid ${color}`,
                        borderRadius: '12px',
                        padding: '12px',
                        margin: '4px 0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onClick={() => setExpandedCategory(expandedCategory === groupName ? null : groupName)}
                    >
                      <IonIcon 
                        icon={getGroupIcon(groupName)} 
                        style={{ 
                          fontSize: '20px', 
                          color: color 
                        }} 
                      />
                      <h4 style={{
                        margin: '0',
                        color: color,
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        {groupName} ({groupSubjects.length})
                      </h4>
                    </div>
                    <div slot="content" style={{ padding: '8px' }}>
                      <IonAccordionGroup>
                  {groupSubjects.map((subject) => {
                    const languages = getLanguagesForSubject(subject);
                    const hasLanguages = languages.length > 0;
                    
                    return (
                      <IonAccordion key={subject} value={subject}>
                        <IonItem slot="header" style={{ '--background': 'transparent' }}>
                          <IonIcon 
                            icon={getGroupIcon(groupName)} 
                            style={{ 
                              fontSize: '20px', 
                              color: color, 
                              marginRight: '12px'
                            }} 
                          />
                          <IonLabel>
                            <h3 style={{ 
                              margin: '0', 
                              fontWeight: 'bold', 
                              color: color,
                              fontSize: '16px'
                            }}>
                              {subject}
                            </h3>
                          </IonLabel>
                        </IonItem>
                        <div slot="content" style={{ padding: '8px' }}>
                          {hasLanguages ? (
                            <IonGrid>
                              <IonRow>
                                {languages.map((language) => (
                                  <IonCol size="12" key={language}>
                                    <div style={{ marginBottom: '8px' }}>
                                      <IonIcon 
                                        icon={languageOutline} 
                                        style={{ 
                                          fontSize: '18px', 
                                          color: '#8E44AD', 
                                          marginRight: '8px'
                                        }} 
                                      />
                                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#8E44AD' }}>
                                        {subject} ({language})
                                      </span>
                                    </div>
                                    <IonGrid>
                                      <IonRow>
                                        {getFilteredBooks(selectedGrade, subject, language).map((book) => (
                                          <IonCol size="6" key={book.id}>
                                            <IonCard 
                                              button 
                                              onClick={() => setViewingBook(book)}
                                              style={{ 
                                                backgroundColor: 'transparent', 
                                                border: '1px solid #444'
                                              }}
                                            >
                                              <IonCardContent style={{ padding: '8px' }}>
                                                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                                  <div style={{
                                                    width: '50px', height: '60px', borderRadius: '4px',
                                                    backgroundImage: `url(${book.frontPhoto})`,
                                                    backgroundSize: 'cover', backgroundPosition: 'center'
                                                  }} />
                                                  <div style={{
                                                    width: '50px', height: '60px', borderRadius: '4px',
                                                    backgroundImage: `url(${book.backPhoto})`,
                                                    backgroundSize: 'cover', backgroundPosition: 'center'
                                                  }} />
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                                                  {book.title}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                                                  {book.author}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                                                  Condition: {getConditionText(book.condition)}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>
                                                    R{book.price}
                                                  </div>
                                                  {book.quantity > 0 ? (
                                                    <IonBadge color="success" style={{ fontSize: '9px' }}>
                                                      {book.quantity} available
                                                    </IonBadge>
                                                  ) : (
                                                    <IonBadge color="danger" style={{ fontSize: '9px' }}>
                                                      Sold Out
                                                    </IonBadge>
                                                  )}
                                                </div>
                                              </IonCardContent>
                                            </IonCard>
                                          </IonCol>
                                        ))}
                                        {userType === 'seller' && (
                                          <IonCol size="6">
                                            <IonCard 
                                              button 
                                              onClick={() => handleTextbookClick(subject, language)}
                                              style={{ 
                                                backgroundColor: 'transparent', 
                                                border: '2px dashed #666',
                                                margin: '4px 0',
                                                minHeight: '140px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                              }}
                                            >
                                              <IonCardContent style={{ padding: '12px', textAlign: 'center' }}>
                                                <IonIcon icon={cameraOutline} size="large" style={{ marginBottom: '8px', opacity: 0.5 }} />
                                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                                  List New
                                                </div>
                                              </IonCardContent>
                                            </IonCard>
                                          </IonCol>
                                        )}
                                      </IonRow>
                                    </IonGrid>
                                  </IonCol>
                                ))}
                              </IonRow>
                            </IonGrid>
                          ) : (
                            <IonGrid>
                              <IonRow>
                                {getFilteredBooks(selectedGrade, subject).map((book) => (
                                  <IonCol size="6" key={book.id}>
                                    <IonCard 
                                      button 
                                      onClick={() => setViewingBook(book)}
                                      style={{ 
                                        backgroundColor: 'transparent', 
                                        border: '1px solid #444'
                                      }}
                                    >
                                      <IonCardContent style={{ padding: '8px' }}>
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                          <div style={{
                                            width: '50px', height: '60px', borderRadius: '4px',
                                            backgroundImage: `url(${book.frontPhoto})`,
                                            backgroundSize: 'cover', backgroundPosition: 'center'
                                          }} />
                                          <div style={{
                                            width: '50px', height: '60px', borderRadius: '4px',
                                            backgroundImage: `url(${book.backPhoto})`,
                                            backgroundSize: 'cover', backgroundPosition: 'center'
                                          }} />
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                                          {book.title}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                                          {book.author}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                                          Condition: {getConditionText(book.condition)}
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>
                                          R{book.price}
                                        </div>
                                      </IonCardContent>
                                    </IonCard>
                                  </IonCol>
                                ))}
                                {userType === 'seller' && (
                                  <IonCol size="6">
                                    <IonCard 
                                      button 
                                      onClick={() => handleTextbookClick(subject)}
                                      style={{ 
                                        backgroundColor: 'transparent', 
                                        border: '2px dashed #666',
                                        margin: '4px 0',
                                        minHeight: '140px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <IonCardContent style={{ padding: '12px', textAlign: 'center' }}>
                                        <IonIcon icon={cameraOutline} size="large" style={{ marginBottom: '8px', opacity: 0.5 }} />
                                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                          List New
                                        </div>
                                      </IonCardContent>
                                    </IonCard>
                                  </IonCol>
                                )}
                              </IonRow>
                            </IonGrid>
                          )}
                        </div>
                      </IonAccordion>
                    );
                      })}
                      </IonAccordionGroup>
                    </div>
                  </IonAccordion>
                </IonAccordionGroup>
              </div>
            );
          });
        })()}
        
        {userType === 'seller' && (
          <IonButton 
            expand="block" 
            fill="outline" 
            onClick={() => {
              setSelectedContext({ grade: selectedGrade, subject: 'Custom' });
              setShowBookDetails(true);
            }}
            style={{ marginTop: '20px' }}
          >
            Add Custom Textbook
          </IonButton>
        )}
        {renderPhotoViewer()}
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    const gradeColors = {
      'Grade R': '#FF6B6B',
      'Grade 1': '#4ECDC4', 
      'Grade 2': '#45B7D1',
      'Grade 3': '#96CEB4',
      'Grade 4': '#FFEAA7',
      'Grade 5': '#DDA0DD',
      'Grade 6': '#98D8C8',
      'Grade 7': '#F7DC6F',
      'Grade 8': '#BB8FCE',
      'Grade 9': '#85C1E9',
      'Grade 10': '#F8C471',
      'Grade 11': '#82E0AA',
      'Grade 12': '#F1948A'
    };
    return gradeColors[grade as keyof typeof gradeColors] || '#95A5A6';
  };

  const getGradeIcon = (grade: string) => {
    const gradeIcons = {
      'Grade R': happyOutline,
      'Grade 1': schoolOutline,
      'Grade 2': schoolOutline,
      'Grade 3': schoolOutline,
      'Grade 4': libraryOutline,
      'Grade 5': libraryOutline,
      'Grade 6': libraryOutline,
      'Grade 7': rocketOutline,
      'Grade 8': rocketOutline,
      'Grade 9': rocketOutline,
      'Grade 10': starOutline,
      'Grade 11': trophyOutline,
      'Grade 12': diamondOutline
    };
    return gradeIcons[grade as keyof typeof gradeIcons] || schoolOutline;
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ margin: '0 0 16px 0' }}>School Textbooks</h2>
      <h3 style={{ margin: '0 0 16px 0', color: '#666' }}>Select Grade Level</h3>
      
      <IonGrid>
        <IonRow>
          {grades.map((grade, index) => {
            const color = getGradeColor(grade);
            const icon = getGradeIcon(grade);
            
            return (
              <IonCol size="6" key={grade}>
                <IonCard 
                  button 
                  onClick={() => setSelectedGrade(grade)}
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = `2px solid ${color}40`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <IonCardContent style={{ 
                    textAlign: 'center', 
                    padding: '16px', 
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <IonIcon 
                      icon={icon} 
                      style={{ 
                        fontSize: '70px', 
                        color: color, 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        zIndex: 1,
                        strokeWidth: '0.3px',
                        opacity: 0.25,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }} 
                    />
                    <div style={{ 
                      position: 'relative', 
                      zIndex: 2, 
                      fontWeight: 'bold', 
                      color: '#333',
                      fontSize: '14px',
                      lineHeight: '1.2',
                      textAlign: 'center',
                      wordWrap: 'break-word',
                      hyphens: 'auto'
                    }}>
                      {grade}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            );
          })}
        </IonRow>
      </IonGrid>
      {renderPhotoViewer()}
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color={toastColor}
      />
    </div>
  );
};

export default SchoolGradesComponent;