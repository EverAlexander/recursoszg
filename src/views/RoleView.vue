<template>
    <div data-app>
        <!-- Card Principal -->
        <v-card class="p-4 mt-4 elevation-3">
            <v-container>
                <v-row align="center" justify="space-between">
                    <v-col>
                        <h2 class="black-secondary">{{ title }}</h2>
                    </v-col>
                    <v-col class="d-flex justify-end">
                        <base-button type="primary" title="Agregar" @click="addRecord()" />
                    </v-col>
                </v-row>

                <!-- Campo Buscar -->
                <v-row class="mt-3">
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="search" variant="outlined" label="Buscar" clearable dense />
                    </v-col>
                </v-row>
            </v-container>

            <!-- Tabla de Datos -->
            <v-data-table-server :headers="headers" :items-length="total" :items="records" :loading="loading"
                item-title="id_marca" item-value="id_marca" class="mt-4" @update:options="getDataFromApi">
                <!-- Acciones -->
                <template v-slot:[`item.actions`]="{ item }">
                    <v-icon size="20" class="mr-2" @click="editItem(item.raw)" icon="mdi-pencil" />
                    <v-icon size="20" class="mr-2" @click="deleteItem(item.raw)" icon="mdi-delete" />
                </template>

                <!-- Sin datos -->
                <template v-slot:no-data>
                    <v-row justify="center" class="my-4">
                        <v-icon size="36" @click="initialize" icon="mdi-refresh" class="cursor-pointer" />
                    </v-row>
                </template>
            </v-data-table-server>
        </v-card>

        <!-- Dialog Formulario -->
        <v-dialog v-model="dialog" max-width="400px" persistent>
            <v-card class="pa-4 rounded-lg elevation-4">
                <!-- Título -->
                <v-card-title class="justify-center">
                    <h2 class="black-secondary text-center">{{ formTitle }}</h2>
                </v-card-title>

                <v-card-text>
                    <base-input label="Rol" v-model="v$.editedItem.name.$model" :rules="v$.editedItem.name" outlined
                        dense />
                    <input type="hidden" v-model="v$.editedItem.idRol.$model" />
                </v-card-text>

                <v-card-actions class="justify-center">
                    <base-button type="primary" title="Guardar" @click="save" />
                    <base-button type="secondary" title="Cancelar" @click="close" class="ms-2" />
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog Eliminar -->
        <v-dialog v-model="dialogDelete" max-width="400px">
            <v-card class="pa-4">
                <v-container>
                    <h3 class="black-secondary text-center mb-4">Eliminar registro</h3>
                    <v-row>
                        <v-col class="d-flex justify-center">
                            <base-button type="primary" title="Confirmar" @click="deleteItemConfirm" />
                            <base-button class="ms-2" type="secondary" title="Cancelar" @click="closeDelete" />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-dialog>
    </div>
</template>




<script>
import { useVuelidate } from "@vuelidate/core";
import { messages } from "@/utils/validators/i18n-validators";
import { helpers, minLength, required, email } from "@vuelidate/validators";

import rolapi from "@/services/rolApi";

import BaseButton from "../components/base-components/BaseButton.vue";
import BaseInput from "../components/base-components/BaseInput.vue";
import BaseSelect from "../components/base-components/BaseSelect.vue";
import useAlert from "../composables/useAlert";

const { alert } = useAlert();
const langMessages = messages["es"].validations;

export default {
    components: { BaseButton, BaseInput, BaseSelect },
    setup() {
        return { v$: useVuelidate() };
    },
    data() {
        return {
            selected: [],
            dialog: false,
            dialogDelete: false,
            headers: [
                { title: "Id", key: "idRol" },
                { title: "Rol", key: "name" },
                { title: "Creacion", key: "created_at" },
                { title: "Accion", key: "actions", sortable: false, align: 'center' },
            ],
            search: "",
            records: [],
            editedIndex: -1,
            title: "Roles",
            total: 0,
            options: {},
            editedItem: {
                name: "",
                idRol: "",
            },
            defaultItem: {
                name: "",
                idRol: "",
            },
            loading: false,
            debounce: 0,
        };
    },

    watch: {
        dialogDelete(val) {
            val || this.closeDelete();
        },

        search() {
            // Reiniciar a página 1 siempre que se busca
            this.options.page = 1;
            this.getDataFromApi(this.options);
        },

        dialog(val) {
            val || this.close();
        },

        dialogBlock(val) {
            val || this.closeBlock();
        },
    },

    // Validations
    validations() {
        return {
            editedItem: {
                name: {
                    required,
                    minLength: minLength(1),
                },
                idRol: {
                    minLength: minLength(1),
                }
            },
        };
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "Nuevo registro" : "Editar registro";
        },
    },

    created() {
        this.initialize();
    },

    beforeMount() {
        this.getDataFromApi({ page: 1, itemsPerPage: 10, sortBy: [], search: '' });
    },

    methods: {
        async initialize() {
            this.loading = true;
            this.records = [];

            let requests = [this.getDataFromApi()];

            const responses = await Promise.all(requests).catch((error) => {
                alert.error("No fue posible obtener el registro.");
            });

            if (responses) {
            }

            this.loading = false;
        },

        editItem(item) {
            this.editedIndex = this.records.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialog = true;
        },

        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        async save() {
            this.v$.$validate();
            if (this.v$.$invalid) {
                alert.error("Campos obligatorios");
                return;
            }

            // Updating record
            if (this.editedIndex > -1) {
                const edited = Object.assign(
                    this.records[this.editedIndex],
                    this.editedItem
                );

                try {

                    const { data } = await rolapi.put(`/${edited.idRol}`, edited);

                    alert.success(data.message);
                } catch (error) {
                    alert.error("No fue posible actualizar el registro.");
                }

                this.close();
                this.initialize();
                return;
            }

            try {

                const payload = {
                    name: this.editedItem.name,
                };
                const { data } = await rolapi.post(null, payload);

                alert.success(data.message);
            } catch (error) {
                alert.error("No fue posible crear el registro.");
            }

            this.close();
            this.initialize();
            return;
        },

        deleteItem(item) {
            this.editedIndex = this.records.indexOf(item);
            this.editedItem = Object.assign({}, item);

            this.dialogDelete = true;
        },

        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        async deleteItemConfirm() {
            try {
                const { data } = await rolapi.delete(`/${this.editedItem.idRol}`, {
                    params: {
                        id: this.editedItem.idRol,
                    },
                });

                alert.success(data.message);
            } catch (error) {
                this.close();
            }

            this.initialize();
            this.closeDelete();
        },


        async getDataFromApi(options) {
            this.loading = true;

            if (options) {
                this.options = options;
            }

            clearTimeout(this.debounce);
            this.debounce = setTimeout(async () => {
                try {
                    const { data } = await rolapi.get(null, {
                        params: {
                            ...this.options,
                            search: this.search
                        },
                    });

                    // 🔹 Imprime la respuesta completa
                    console.log("Respuesta completa del API:", data);

                    // 🔹 Si quieres ver solo data.data y total
                    console.log("data.data:", data.data);
                    console.log("data.total:", data.total);

                    this.records = data.data;
                    this.total = data.total;

                } catch (error) {
                    console.error("Error al obtener los registros:", error);
                    alert.error("No fue posible obtener los registros.");
                }

                this.loading = false;
            }, 500);
        },


        addRecord() {
            this.dialog = true;
            this.editedIndex = -1;
            this.editedItem = Object.assign({}, this.defaultItem);
            this.v$.$reset();
        },
    },
};
</script>