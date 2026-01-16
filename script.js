// Job Application Tracker
class JobTracker {
    constructor() {
        this.jobs = this.loadJobs();
        this.currentFilter = 'All';
        this.editingJobId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderJobs();
        this.updateStats();
        this.setDefaultDate();
    }

    setupEventListeners() {
        const form = document.getElementById('job-form');
        const filterSelect = document.getElementById('filter-status');

        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => this.handleFilterChange(e));
        }
    }

    setDefaultDate() {
        const dateInput = document.getElementById('date-applied');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const companyName = document.getElementById('company-name')?.value.trim();
        const position = document.getElementById('position')?.value.trim();
        const status = document.getElementById('status')?.value;
        const dateApplied = document.getElementById('date-applied')?.value;
        const notes = document.getElementById('notes')?.value.trim();

        if (!companyName || !position || !status || !dateApplied) {
            alert('Please fill in all required fields');
            return;
        }

        if (this.editingJobId) {
            this.updateJob(this.editingJobId, {
                company: companyName,
                position: position,
                status: status,
                dateApplied: dateApplied,
                notes: notes
            });
            this.editingJobId = null;
        } else {
            this.addJob({
                company: companyName,
                position: position,
                status: status,
                dateApplied: dateApplied,
                notes: notes
            });
        }

        e.target.reset();
        this.setDefaultDate();
    }

    handleFilterChange(e) {
        this.currentFilter = e.target.value;
        this.renderJobs();
    }

    addJob(jobData) {
        const job = {
            id: Date.now().toString(),
            ...jobData,
            createdAt: new Date().toISOString()
        };

        this.jobs.push(job);
        this.saveJobs();
        this.renderJobs();
        this.updateStats();
    }

    updateJob(id, jobData) {
        const index = this.jobs.findIndex(job => job.id === id);
        if (index !== -1) {
            this.jobs[index] = {
                ...this.jobs[index],
                ...jobData,
                updatedAt: new Date().toISOString()
            };
            this.saveJobs();
            this.renderJobs();
            this.updateStats();
        }
    }

    deleteJob(id) {
        if (confirm('Are you sure you want to delete this job application?')) {
            this.jobs = this.jobs.filter(job => job.id !== id);
            this.saveJobs();
            this.renderJobs();
            this.updateStats();
        }
    }

    editJob(id) {
        const job = this.jobs.find(job => job.id === id);
        if (!job) return;

        this.editingJobId = id;

        const companyInput = document.getElementById('company-name');
        const positionInput = document.getElementById('position');
        const statusInput = document.getElementById('status');
        const dateInput = document.getElementById('date-applied');
        const notesInput = document.getElementById('notes');

        if (companyInput) companyInput.value = job.company;
        if (positionInput) positionInput.value = job.position;
        if (statusInput) statusInput.value = job.status;
        if (dateInput) dateInput.value = job.dateApplied;
        if (notesInput) notesInput.value = job.notes || '';

        // Scroll to form
        const form = document.getElementById('job-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    renderJobs() {
        const jobsList = document.getElementById('jobs-list');
        if (!jobsList) return;

        const filteredJobs = this.getFilteredJobs();

        if (filteredJobs.length === 0) {
            const message = this.currentFilter === 'All' 
                ? 'No job applications yet. Add your first application above!'
                : `No applications with status "${this.currentFilter}"`;
            jobsList.innerHTML = `<p class="empty-state">${message}</p>`;
            return;
        }

        jobsList.innerHTML = filteredJobs
            .sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied))
            .map(job => this.createJobCard(job))
            .join('');

        // Add event listeners to action buttons
        filteredJobs.forEach(job => {
            const editBtn = document.getElementById(`edit-${job.id}`);
            const deleteBtn = document.getElementById(`delete-${job.id}`);

            if (editBtn) {
                editBtn.addEventListener('click', () => this.editJob(job.id));
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteJob(job.id));
            }
        });
    }

    createJobCard(job) {
        const formattedDate = new Date(job.dateApplied).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const statusClass = job.status.replace(/\s+/g, '.');
        const notesSection = job.notes 
            ? `<div class="job-notes"><strong>Notes:</strong> ${this.escapeHtml(job.notes)}</div>` 
            : '';

        return `
            <div class="job-card">
                <div class="job-header">
                    <div class="job-info">
                        <h3>${this.escapeHtml(job.position)}</h3>
                        <div class="company">${this.escapeHtml(job.company)}</div>
                    </div>
                    <div class="job-actions">
                        <button class="btn-small btn-edit" id="edit-${job.id}">Edit</button>
                        <button class="btn-small btn-delete" id="delete-${job.id}">Delete</button>
                    </div>
                </div>
                <div class="job-details">
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">
                            <span class="status-badge status-${statusClass}">${this.escapeHtml(job.status)}</span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date Applied</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                </div>
                ${notesSection}
            </div>
        `;
    }

    getFilteredJobs() {
        if (this.currentFilter === 'All') {
            return this.jobs;
        }
        return this.jobs.filter(job => job.status === this.currentFilter);
    }

    updateStats() {
        const totalElement = document.getElementById('total-jobs');
        const pendingElement = document.getElementById('pending-jobs');
        const interviewElement = document.getElementById('interview-jobs');
        const offerElement = document.getElementById('offer-jobs');

        if (totalElement) totalElement.textContent = this.jobs.length;

        const pending = this.jobs.filter(job => 
            job.status === 'Applied' || job.status === 'Phone Screen'
        ).length;
        if (pendingElement) pendingElement.textContent = pending;

        const interviews = this.jobs.filter(job => job.status === 'Interview').length;
        if (interviewElement) interviewElement.textContent = interviews;

        const offers = this.jobs.filter(job => job.status === 'Offer').length;
        if (offerElement) offerElement.textContent = offers;
    }

    saveJobs() {
        try {
            localStorage.setItem('jobTrackerJobs', JSON.stringify(this.jobs));
        } catch (error) {
            console.error('Error saving jobs:', error);
        }
    }

    loadJobs() {
        try {
            const stored = localStorage.getItem('jobTrackerJobs');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading jobs:', error);
            return [];
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JobTracker();
});
