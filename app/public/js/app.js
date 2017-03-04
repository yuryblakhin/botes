'use strict';


new Vue({
    http: {
        root: '/api',
    },
    el: '#app',
    data: {
        bote: {
            id: null,
            title: null,
            body: null,
            last_saved: null
        },
        botes: [],
        save_timeout: null,
        i_date: Date.now(),
    },
    computed: {
        word_count: function word_count() {
            if (!this.bote.body || this.bote.body.trim() === '') {
                return 0;
            }
            return this.bote.body.trim().split(' ').length;
        },
        botes_sorted: function botes_sorted() {
            return this.botes.sort(function(a, b) {
                return a['last_saved'] < b['last_saved'];
            });
        },
        last_saved: function last_saved() {
            if (!this.bote.last_saved) {
                return 'Soon';
            }
            return moment(this.bote.last_saved).format('DD.MM.YYYY H:mm:ss');
        },
    },
    mounted: function mounted() {
        this.fetch_botes();
    },
    methods: {
        fetch_botes: function fetch_botes() {
            this.$http.get('/api').then(function(response) {
                this.$set(this, 'botes', response.data);
            });
        },
        store_botes: function store_botes() {
            this.$http.post('/api/update', this.bote).then(function(response) {
                this.botes.unshift(response.data);
            });
            this.touch_last_saved();
            this.fetch_botes();
        },
        delete_bote: function delete_bote(id) {
            this.$http.delete('/api/destroy/' + id);
            this.clear_bote();
            this.fetch_botes();
        },
        clear_bote: function clear_bote() {
            this.bote = {
                id: null,
                title: null,
                body: null,
                last_saved: null
            };
        },
        open_bote: function open_bote(id) {
            this.$http.get('/api/show/' + id).then(function(response) {
                this.bote.id = response.data.bote.id
                this.bote.title = response.data.bote.title
                this.bote.body = response.data.bote.body
                this.bote.last_saved = response.data.bote.last_saved
            })
        },
        save_bote: function save_bote() {
            if (!this.bote.id) {
                this.i_date = Date.now();
                this.bote.id = this.i_date;
                this.$http.post('/api/store', this.bote).then(function(response) {
                    console.log(response.data);
                });
            }
            this.start_timeout();
        },
        start_timeout: function start_timeout() {
            self = this;
            if (this.save_timeout !== null) return;
            this.save_timeout = setTimeout(function() {
                self.store_botes();
                self.clear_timeout();
            }, 5000);
        },
        clear_timeout: function clear_timeout() {
            clearInterval(this.save_timeout);
            this.save_timeout = null;
        },
        touch_last_saved: function touch_last_saved() {
            this.bote.last_saved = Date.now();
        }
    }
});