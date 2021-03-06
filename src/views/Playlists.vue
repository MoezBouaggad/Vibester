<template>
  <div class="playlists">
    <div class="p-side">
      <Header title="Playlists">
        <div class="actions" slot="actions">
          <i @click="newPlaylist" class="fa fa-plus"></i>
        </div>
      </Header>
      <ul class="p-list">
        <li  @dblclick="startEdit(p)" @contextmenu="openMenu(p)" :class="{'p-active':selectedPlaylist.id==p.id}" @click="goToPlaylist(p)" class="p-item" v-for="p in playlists" :key="p.id">
          <template v-if="write && p.id==selectedPlaylist.id">
            <input maxlength="23" :value="p.name" class="p-input" @blur="cancelRename" @keypress.13="rename" autofocus  ref="pInput" type="text">
            <div class="p-active-bar"></div>
          </template>
          <template v-else>
            <span class="name">{{p.name}}</span>
            <span class="total">{{p.songs.length}}</span>
          </template>

        </li>
      </ul>
    </div>
    <div class="p-body">
      <Playlist @rename="handleRenameEvent" @delete="handleDeleteEvent" :noPlaylist="noPlaylist" :key="selectedPlaylist.name+selectedPlaylist.id" :p="selectedPlaylist"/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Header from "@/components/Header.vue";
import Playlist from "@/components/Playlist.vue";
import bus from "@/services/bus";
import electron from "electron";
import { IPlaylist } from "@/models/playlist";
import {
  NEW_PLAYLIST,
  RENAME_PLAYLIST,
  DELETE_PLAYLIST
} from "@/types/actionTypes";

export default Vue.extend({
  data() {
    return {
      defaultPlaylist: { id: -1, name: "", songs: [] },
      selectedPlaylist: { id: -1, name: "", songs: [] } as IPlaylist,
      write: false
    };
  },
  components: {
    Header,
    Playlist
  },
  computed: {
    playlists() {
      return this.$store.state.playlists;
    },
    noPlaylist() {
      return this.$store.state.playlists.length == 0;
    }
  },
  methods: {
    openMenu(p: IPlaylist) {
      const template: electron.MenuItemConstructorOptions[] = [
        {
          label: "Rename",
          click: () => this.startEdit(p)
        },
        {
          label: "Delete",
          click: () => this.delete(p.id)
        }
      ];
      const context = electron.remote.Menu.buildFromTemplate(template);
      context.popup({});
    },
    startEdit(p: IPlaylist) {
      if (this.write) return;
      this.selectedPlaylist = p;
      this.write = true;
      // BIG HACK INCOMING
      // IF THIS FAILS WE GOT PROBLEMS
      setTimeout(() => {
        (this.$refs.pInput[0] as HTMLInputElement).focus();
      }, 1);
      //
    },
    cancelRename() {
      this.write = false;
    },
    handleRenameEvent(p: IPlaylist) {
      this.startEdit(p);
    },
    handleDeleteEvent(p: IPlaylist) {
      this.delete(p.id);
    },
    delete(id) {
      this.$store.dispatch(DELETE_PLAYLIST, id).then(() => {
        this.selectedPlaylist =
          this.playlists[this.playlists.length - 1] || this.defaultPlaylist;
      });
    },
    rename(e) {
      this.write = false;
      if (e.target.value == "") {
        console.warn("empty name not allowed");
        return;
      }
      this.$store.dispatch(RENAME_PLAYLIST, {
        id: this.selectedPlaylist.id,
        name: e.target.value
      });
    },
    goToPlaylist(p: IPlaylist) {
      this.selectedPlaylist = p;
      bus.$emit("playlistCue", p);
    },
    newPlaylist() {
      this.$store.dispatch(NEW_PLAYLIST).then((p: IPlaylist) => {
        this.selectedPlaylist = p;
      });
    }
  }
});
</script>
