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
    const toggleTheme = document.getElementById('toggleTheme');

    newPostBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    submitPost.addEventListener('click', createPost);
    toggleTheme.addEventListener('click', toggleDarkMode);

    window.addEventListener('popstate', handleNavigation);

    await handleNavigation();
});

async function handleNavigation() {
    const path = window.location.pathname;
    const app = document.getElementById('app');

    if (path === '/' || path === '/index.html') {
        await loadPosts();
    } else if (path.startsWith('/post/')) {
        const postId = parseInt(path.split('/')[2]);
        await loadSinglePost(postId);
    }
}

async function loadPosts() {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="spinner"></div>';

    try {
        const posts = await backend.getPosts();
        app.innerHTML = '';

        posts.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h2 onclick="navigateToPost(${post.id})">${post.title}</h2>
                <div class="post-meta">By ${post.author} on ${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                <div>${post.body.substring(0, 200)}...</div>
            `;
            app.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        app.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}

async function loadSinglePost(postId) {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="spinner"></div>';

    try {
        const post = await backend.getPost(postId);
        if (post && post.length > 0) {
            const postData = post[0];
            app.innerHTML = `
                <button class="btn-secondary back-button" onclick="history.back()">Back to Home</button>
                <div class="post">
                    <h2>${postData.title}</h2>
                    <div class="post-meta">By ${postData.author} on ${new Date(Number(postData.timestamp) / 1000000).toLocaleString()}</div>
                    <div>${postData.body}</div>
                </div>
            `;
        } else {
            app.innerHTML = '<p>Post not found.</p>';
        }
    } catch (error) {
        console.error('Error loading post:', error);
        app.innerHTML = '<p>Error loading post. Please try again later.</p>';
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
        document.body.style.overflow = 'auto';
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

function toggleDarkMode() {
    document.body.setAttribute('data-theme', document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

window.navigateToPost = function(postId) {
    history.pushState(null, '', `/post/${postId}`);
    loadSinglePost(postId);
};
