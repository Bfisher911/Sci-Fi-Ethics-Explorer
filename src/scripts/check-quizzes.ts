import { scifiAuthorData } from '../data/scifi-authors';
import { authorQuizzes } from '../data/scifi-author-quizzes';
import { mediaItems } from '../data/scifi-media';

const authorQuizKeys = Object.keys(authorQuizzes);
const missingAuthorQuizzes = scifiAuthorData.filter(a => !authorQuizKeys.includes(a.id)).map(a => a.id);

console.log("Missing Author Quizzes:", missingAuthorQuizzes);

// Now for media items
// How do media items associate with quizzes? Let's check mediaItems structure.
console.log("Media items quiz structure check:", Object.keys(mediaItems[0]));

