<template>
    <div class="block-fields">
        <template v-if="infoHero">
            <div class="form-grid">
                <label class="field">
                    <span>Eyebrow</span>
                    <input v-model.trim="infoHero.eyebrow" maxlength="80">
                </label>
                <label class="field">
                    <span>Titel</span>
                    <input v-model.trim="infoHero.title" maxlength="160">
                </label>
                <label class="field field--wide">
                    <span>Beschreibung <small>optional</small></span>
                    <textarea v-model="infoHero.description" rows="2" maxlength="500" />
                </label>
            </div>
            <admin-action-list v-model="infoHero.actions" />
        </template>

        <template v-else-if="landingHero">
            <div class="form-grid">
                <label class="field">
                    <span>Eyebrow</span>
                    <input v-model.trim="landingHero.eyebrow" maxlength="80">
                </label>
                <label class="field">
                    <span>Titel</span>
                    <input v-model.trim="landingHero.title" maxlength="160">
                </label>
                <label class="field field--wide">
                    <span>Einleitung <small>optional</small></span>
                    <textarea v-model="landingHero.lead" rows="3" maxlength="500" />
                </label>
                <label class="check-field">
                    <input v-model="landingHero.showNextScreening" type="checkbox">
                    <span>Nächste Vorstellung anzeigen</span>
                </label>
            </div>
            <admin-action-list v-model="landingHero.actions" />
        </template>

        <template v-else-if="markdownBlock">
            <div class="form-grid">
                <label class="field field--wide">
                    <span>Abschnittstitel <small>optional</small></span>
                    <input v-model="markdownBlock.title" maxlength="160">
                </label>
                <label class="field field--wide">
                    <span>Inhalt <small>Markdown: Absätze, Listen, Tabellen, [Links](url)</small></span>
                    <textarea v-model="markdownBlock.content" rows="10" maxlength="20000" />
                </label>
            </div>
        </template>

        <template v-else-if="programOverview">
            <div class="form-grid">
                <label class="field field--wide">
                    <span>Titel</span>
                    <input v-model.trim="programOverview.title" maxlength="160">
                </label>
                <label class="field">
                    <span>Einträge überspringen</span>
                    <input v-model.number="programOverview.offset" type="number" min="0" max="20">
                </label>
                <label class="field">
                    <span>Anzahl Einträge</span>
                    <input v-model.number="programOverview.limit" type="number" min="1" max="20">
                </label>
                <label class="field field--wide">
                    <span>Spielort enthält <small>optional</small></span>
                    <input v-model="programOverview.venueFilter" maxlength="160" placeholder="z. B. Innenhof">
                </label>
                <label class="field">
                    <span>Button-Text <small>optional</small></span>
                    <input v-model="programOverview.linkLabel" maxlength="80">
                </label>
                <label class="field">
                    <span>Button-Ziel <small>optional</small></span>
                    <input v-model="programOverview.linkTo" maxlength="1000" placeholder="/programm">
                </label>
            </div>
        </template>

        <template v-else-if="cardGrid">
            <div class="form-grid">
                <label class="field field--wide">
                    <span>Abschnittstitel <small>optional</small></span>
                    <input v-model="cardGrid.title" maxlength="160">
                </label>
            </div>
            <div class="item-list">
                <p class="item-list_label">Karten</p>
                <div v-for="(card, index) in cardGrid.cards" :key="index" class="item-row item-row--stacked">
                    <div class="item-row_fields">
                        <input v-model.trim="card.title" maxlength="160" placeholder="Titel">
                        <input v-model="card.meta" maxlength="200" placeholder="Meta-Zeile (optional)">
                        <textarea v-model.trim="card.text" rows="2" maxlength="1000" placeholder="Beschreibung" />
                    </div>
                    <button type="button" class="icon-button" aria-label="Karte entfernen" @click="cardGrid.cards.splice(index, 1)">
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                    </button>
                </div>
                <button type="button" class="add-button" @click="cardGrid.cards.push({ title: '', text: '', meta: null })">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Karte hinzufügen
                </button>
            </div>
        </template>

        <template v-else-if="imageBlock">
            <div class="form-grid">
                <label class="field field--wide">
                    <span>Abschnittstitel <small>optional</small></span>
                    <input v-model="imageBlock.title" maxlength="160">
                </label>
                <label class="field field--wide">
                    <span>Bild-URL oder Pfad</span>
                    <input v-model.trim="imageBlock.src" maxlength="1000" placeholder="/media/… oder https://…">
                </label>
                <label class="field">
                    <span>Alternativtext</span>
                    <input v-model.trim="imageBlock.alt" maxlength="300">
                </label>
                <label class="field">
                    <span>Bildunterschrift <small>optional</small></span>
                    <input v-model="imageBlock.caption" maxlength="300">
                </label>
                <label class="upload-control">
                    <Icon name="material-symbols:add-photo-alternate-rounded" aria-hidden="true" />
                    <span>{{ uploading ? 'Bild wird hochgeladen …' : 'Bild hochladen' }}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" :disabled="uploading" @change="uploadImage">
                </label>
            </div>
        </template>

        <template v-else-if="splitBlock">
            <div class="form-grid">
                <label class="field field--wide">
                    <span>Titel</span>
                    <input v-model.trim="splitBlock.title" maxlength="160">
                </label>
                <label class="field field--wide">
                    <span>Text <small>Markdown</small></span>
                    <textarea v-model="splitBlock.body" rows="6" maxlength="10000" />
                </label>
                <label class="field">
                    <span>Link-Text <small>optional</small></span>
                    <input v-model="splitBlock.linkLabel" maxlength="80">
                </label>
                <label class="field">
                    <span>Link-Ziel <small>optional</small></span>
                    <input v-model="splitBlock.linkTo" maxlength="1000" placeholder="/anfahrt">
                </label>
                <label class="field field--wide">
                    <span>Punkteliste <small>ein Punkt pro Zeile</small></span>
                    <textarea v-model="splitPointsText" rows="4" />
                </label>
            </div>
        </template>

        <template v-else-if="network">
            <div class="form-grid">
                <label class="field">
                    <span>Titel Linkliste</span>
                    <input v-model.trim="network.socialTitle" maxlength="120">
                </label>
                <label class="field">
                    <span>Titel Unterstützer</span>
                    <input v-model.trim="network.supportTitle" maxlength="120">
                </label>
                <label class="field field--wide">
                    <span>Text Unterstützer <small>optional</small></span>
                    <textarea v-model="network.supportText" rows="2" maxlength="500" />
                </label>
            </div>
            <div class="item-list">
                <p class="item-list_label">Links</p>
                <div v-for="(link, index) in network.socialLinks" :key="index" class="item-row">
                    <div class="item-row_fields">
                        <input v-model.trim="link.label" maxlength="120" placeholder="Bezeichnung">
                        <input v-model.trim="link.url" maxlength="1000" placeholder="https://…">
                        <input v-model="link.icon" maxlength="120" placeholder="Icon (optional)">
                    </div>
                    <button type="button" class="icon-button" aria-label="Link entfernen" @click="network.socialLinks.splice(index, 1)">
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                    </button>
                </div>
                <button type="button" class="add-button" @click="network.socialLinks.push({ label: '', url: '', icon: null })">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Link hinzufügen
                </button>
            </div>
            <div class="item-list">
                <p class="item-list_label">Unterstützer</p>
                <div v-for="(supporter, index) in network.supporters" :key="index" class="item-row item-row--stacked">
                    <div class="item-row_fields">
                        <input v-model.trim="supporter.label" maxlength="120" placeholder="Name">
                        <input v-model.trim="supporter.url" maxlength="1000" placeholder="https://…">
                        <input v-model="supporter.image" maxlength="1000" placeholder="Logo-Pfad (optional)">
                        <input v-model="supporter.icon" maxlength="120" placeholder="Icon (optional)">
                        <input v-model="supporter.role" maxlength="80" placeholder="Rolle (optional)">
                    </div>
                    <button type="button" class="icon-button" aria-label="Unterstützer entfernen" @click="network.supporters.splice(index, 1)">
                        <Icon name="material-symbols:delete-outline-rounded" aria-hidden="true" />
                    </button>
                </div>
                <button type="button" class="add-button" @click="network.supporters.push({ label: '', url: '', image: null, icon: null, role: null })">
                    <Icon name="material-symbols:add-rounded" aria-hidden="true" />
                    Unterstützer hinzufügen
                </button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { PageBlock } from '~~/types/content';

const block = defineModel<PageBlock>({ required: true });

const uploading = ref(false);

function narrow<Type extends PageBlock['type']>(type: Type) {
    return computed(() => block.value.type === type ? block.value as Extract<PageBlock, { type: Type }> : null);
}

const infoHero = narrow('infoHero');
const landingHero = narrow('landingHero');
const markdownBlock = narrow('markdown');
const programOverview = narrow('programOverview');
const cardGrid = narrow('cardGrid');
const imageBlock = narrow('image');
const splitBlock = narrow('split');
const network = narrow('network');

const splitPointsText = computed({
    get: () => splitBlock.value?.points.join('\n') ?? '',
    set: value => {
        if (splitBlock.value) splitBlock.value.points = value.split('\n');
    },
});

async function uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !imageBlock.value) return;

    uploading.value = true;
    try {
        const body = new FormData();
        body.append('image', file);
        const response = await $fetch<{ path: string }>('/api/admin/upload', { method: 'POST', body });
        imageBlock.value.src = response.path;
    }
    finally {
        uploading.value = false;
        input.value = '';
    }
}
</script>

<style scoped lang="scss">
.block-fields {
    display: grid;
    gap: 1rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    &--wide {
        grid-column: 1 / -1;
    }

    > span {
        font-size: 0.72rem;
        font-weight: 700;
        color: $lightgray200;

        small {
            font-weight: 400;
            color: $lightgray400;
        }
    }
}

.field input,
.field textarea,
.item-row_fields input,
.item-row_fields textarea {
    min-height: 42px;
    padding: 0.5rem 0.75rem;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    font: inherit;
    font-size: 0.85rem;
    color: $lightgray50;

    background: $darkgray950;
    outline: none;

    &:focus-visible {
        border-color: $primary400;
        outline: 2px solid rgb(221 91 69 / 22%);
    }
}

.field textarea,
.item-row_fields textarea {
    resize: vertical;
    line-height: 1.5;
}

.check-field {
    cursor: pointer;

    display: flex;
    gap: 0.5rem;
    align-items: center;
    align-self: end;

    min-height: 42px;

    font-size: 0.85rem;
    color: $lightgray150;
}

.item-list {
    display: grid;
    gap: 0.5rem;

    &_label {
        margin: 0;

        font-size: 0.72rem;
        font-weight: 700;
        color: $lightgray200;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
}

.item-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 40px;
    gap: 0.5rem;
    align-items: start;

    padding: 0.6rem;
    border: 1px solid $darkgray800;
    border-radius: 8px;

    background: $darkgray900;

    &_fields {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.5rem;
    }

    &--stacked &_fields {
        grid-template-columns: repeat(2, minmax(0, 1fr));

        textarea {
            grid-column: 1 / -1;
        }
    }
}

.icon-button {
    cursor: pointer;

    display: grid;
    place-items: center;

    min-width: 40px;
    min-height: 40px;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    color: $lightgray200;

    background: transparent;

    &:hover {
        color: $error300;
        background: rgb(194 37 105 / 8%);
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }
}

.add-button {
    cursor: pointer;

    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    justify-content: center;

    min-height: 40px;
    padding: 0 0.8rem;
    border: 1px dashed $darkgray700;
    border-radius: 8px;

    font: inherit;
    font-size: 0.8rem;
    color: $lightgray200;

    background: transparent;

    &:hover {
        border-color: $secondary600;
        color: $secondary300;
    }

    &:focus-visible {
        outline: 2px solid $primary400;
        outline-offset: 2px;
    }
}

.upload-control {
    cursor: pointer;

    display: inline-flex;
    gap: 0.5rem;
    align-items: center;

    min-height: 42px;
    padding: 0 0.8rem;
    border: 1px dashed $darkgray700;
    border-radius: 8px;

    font-size: 0.85rem;
    color: $lightgray200;

    input {
        display: none;
    }

    svg {
        width: 1.2rem;
        height: 1.2rem;
        color: $secondary300;
    }
}

@include mobileOnly {
    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
