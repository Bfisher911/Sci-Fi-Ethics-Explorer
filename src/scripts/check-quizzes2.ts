import { scifiAuthorData } from '../data/scifi-authors';
import { scifiAuthorQuizzes } from '../data/scifi-author-quizzes';
import { scifiMediaData } from '../data/scifi-media';
// is there a scifiMediaQuizzes? Let's check if the media artifacts have quizzes in them.
console.log("Total authors:", scifiAuthorData.length);
console.log("Total author quizzes:", scifiAuthorQuizzes.length);

const authorQuizTargetIds = scifiAuthorQuizzes.map(q => q.targetId);
const missingAuthorQuizzes = scifiAuthorData.filter(a => !authorQuizTargetIds.includes(a.id)).map(a => a.id);
console.log("Missing Author Quizzes:", missingAuthorQuizzes);

// media images
const mediaMissingImages = scifiMediaData.filter(m => !m.imageUrl || m.imageUrl.includes('.svg')).map(m => m.id);
console.log("Media missing images:", mediaMissingImages);

// Do media items have a quiz or quiz references?
console.log("Media item structure:");
console.log(Object.keys(scifiMediaData[0]));
