import { backend } from 'declarations/backend';

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    quill = new Quill('#editor', {
        theme: 'snow'
    });

    const newPostBtn = document.getElementById('newPostBtn');
    const modal = document.getElementById('newPostModal');
    const closeModal = document.getElementById('closeModal');
    const submitPost = document.getElementById('submitPost');

    newPostBtn.addEventListener('click', () => modal.style.display = 'block');
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    submitPost.addEventListener('click', createPost);

    await loadPosts();
});

async function loadPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '<div class="spinner"></div>';

    try {
        const posts = await backend.getPosts();
        postsContainer.innerHTML = '';

        posts.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-meta">By ${post.author} on ${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                <div>${post.body}</div>
            `;
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}

async function createPost() {
    const titleInput = document.getElementById('postTitle');
    const authorInput = document.getElementById('postAuthor');
    const submitBtn = document.getElementById('submitPost');

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const body = quill.root.innerHTML;

    if (!title || !author || !body) {
        alert('Please fill in all fields');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting... <div class="spinner"></div>';

    try {
        await backend.createPost(title, body, author);
        document.getElementById('newPostModal').style.display = 'none';
        titleInput.value = '';
        authorInput.value = '';
        quill.setContents([]);
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit';
    }
}
