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
                    <v-icon size="20" class="mr-2" icon="mdi-eye" @click="showDetails(item.raw)" />
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
        <v-dialog v-model="dialog" max-width="600px" persistent>
            <v-card class="pa-4 rounded-lg elevation-4">
                <!-- Título -->
                <v-card-title class="justify-center">
                    <h2 class="black-secondary text-center">{{ formTitle }}</h2>
                </v-card-title>

                <!-- Contenido del formulario -->
                <v-card-text>
                    <v-container>
                        <v-row dense class="mt-3">

                            <v-col cols="12" sm="6">
                                <base-input label="Serial" v-model="v$.editedItem.numero_serie.$model"
                                    :rules="v$.editedItem.numero_serie" outlined dense />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <base-input label="Activo Fijo" v-model="v$.editedItem.activofijo.$model"
                                    :rules="v$.editedItem.activofijo" outlined dense />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <base-select label="Modelo" v-model="v$.editedItem.id_modelo.$model" :items="modelos"
                                    item-title="modelo" item-value="id_modelo" :rules="v$.editedItem.id_modelo" outlined
                                    dense clearable />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <base-input label="Color" v-model="v$.editedItem.color.$model"
                                    :rules="v$.editedItem.color" outlined dense />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <base-select label="Estado" v-model="v$.editedItem.id_estado.$model" :items="estadoInv"
                                    item-title="nombre" item-value="id_estado" :rules="v$.editedItem.id_estado" outlined
                                    dense clearable />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <base-select label="Ubicación" v-model="v$.editedItem.id_ubicacion.$model"
                                    :items="ubicacions" item-title="nombre" item-value="id_ubicacion"
                                    :rules="v$.editedItem.id_ubicacion" outlined dense clearable />
                            </v-col>

                            <v-col cols="12">
                                <base-input label="Observaciones" v-model="v$.editedItem.observacion.$model"
                                    :rules="v$.editedItem.observacion" outlined type="textarea" rows="3" auto-grow />
                            </v-col>

                        </v-row>

                        <!-- Botones centrados -->
                        <v-row class="mt-4">
                            <v-col class="d-flex justify-center gap-3 flex-wrap">
                                <base-button type="primary" title="Guardar" @click="save" />
                                <base-button type="secondary" title="Cancelar" @click="close" />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>

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

        <!-- Dialog Ver detalle consola -->
        <v-dialog v-model="dialogDetails" max-width="600px" persistent>
            <v-card class="pa-6 rounded-xl elevation-3">

                <v-card-title class="d-flex flex-column align-center mb-4">
                    <h2 class="mt-3 text-center">Detalles de la Consola</h2>
                </v-card-title>

                <v-card-text>
                    <v-row dense>

                        <v-col cols="12" sm="6">
                            <v-card class="pa-3 rounded-lg border">
                                <strong>Serial:</strong>
                                <div>{{ details.numero_serie }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" sm="6">
                            <v-card class="pa-3 rounded-lg border">
                                <strong>Activo Fijo:</strong>
                                <div>{{ details.activofijo }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" sm="6">
                            <v-card class="pa-3 rounded-lg border">
                                <strong>Modelo:</strong>
                                <div>{{ details.modelo }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" sm="6">
                            <v-card class="pa-3 rounded-lg border">
                                <strong>Color:</strong>
                                <div>{{ details.color }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" sm="6">
                            <v-card class="pa-3 rounded-lg border">
                                <strong>Estado:</strong>
                                <div>{{ details.estado }}</div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" sm="6">
                            <v-card class="pa-3 rounded-lg border">
                                <strong>Ubicación:</strong>
                                <div>{{ details.ubicacion }}</div>
                            </v-card>
                        </v-col>

                        <!-- OBSERVACIONES -->
                        <v-col cols="12" class="mt-3">
                            <strong>Observaciones:</strong>
                            <v-card class="pa-4 mt-2 rounded-lg border" elevation="0">
                                <p style="white-space: pre-line; margin: 0;">
                                    {{ details.observacion || 'Sin observaciones' }}
                                </p>
                            </v-card>
                        </v-col>

                    </v-row>

                </v-card-text>

                <!-- BOTÓN DE CIERRE -->
                <v-card-actions class="d-flex justify-center mt-2">
                    <base-button type="secondary" title="Cancelar" @click="closeDialogDetails" />
                </v-card-actions>

            </v-card>
        </v-dialog>


    </div>
</template>




<script>
import { useVuelidate } from "@vuelidate/core";
import { messages } from "@/utils/validators/i18n-validators";
import { helpers, minLength, required, email } from "@vuelidate/validators";

import consolaApi from "@/services/GameConsole";
import modelProductApi from "@/services/modelProduct";

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
            details: {},
            modelos: [],
            estadoInv: [],
            ubicacions: [],
            dialog: false,
            dialogDelete: false,
            dialogDetails: false,
            headers: [
                { title: "Serial", key: "numero_serie" },
                { title: "Activo Fijo", key: "activofijo" },
                { title: "Modelo", key: "modelo" },
                { title: "Color", key: "color" },
                { title: "Estado", key: "estado" },
                { title: "Ubicacion", key: "ubicacion" },
                { title: "Accion", key: "actions", sortable: false, align: 'center' },
            ],
            search: "",
            records: [],
            editedIndex: -1,
            title: "Consola de Video juegos",
            total: 0,
            options: {},
            editedItem: {
                numero_serie: "",
                activofijo: "",
                id_modelo: "",
                color: "",
                observacion: "",
                id_estado: "",
                id_ubicacion: "",
            },
            defaultItem: {
                numero_serie: "",
                activofijo: "",
                id_modelo: "",
                color: "",
                observacion: "",
                id_estado: "",
                id_ubicacion: "",
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
                numero_serie: {
                    required,
                    minLength: minLength(1),
                },
                activofijo: {
                    required,
                    minLength: minLength(1),
                },
                id_modelo: {
                    required,
                    minLength: minLength(1),
                },
                color: {
                    minLength: minLength(1),
                },
                observacion: {
                    required
                },
                id_estado: {
                    required
                },
                id_ubicacion: {
                    required
                },

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
        this.getModelo();
        this.getUbicacion;
        this.getEstadosIn();
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

                    const { data } = await consolaApi.put(`/update/${edited.numero_serie}`, edited);

                    alert.success(data.message);
                } catch (error) {
                    alert.error("No fue posible actualizar el registro.");
                }

                this.close();
                this.initialize();
                return;
            }

            //Creating record
            try {

                const payload = {
                    numero_serie: this.editedItem.numero_serie,
                    activofijo: this.editedItem.activofijo,
                    id_modelo: this.editedItem.id_modelo,
                    color: this.editedItem.color,
                    observacion: this.editedItem.observacion,
                    id_estado: this.editedItem.id_estado,
                    id_ubicacion: this.editedItem.id_ubicacion,
                };

                const { data } = await consolaApi.post('/store', payload);

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

        closeDialogDetails() {
            this.dialogDetails = false;            
        },

        async deleteItemConfirm() {
            try {
                const { data } = await consolaApi.delete(`/delete/${this.editedItem.numero_serie}`, {
                    params: {
                        id: this.editedItem.id_modelo,
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

            // Si llegan opciones desde la tabla, las guardo    ||
            if (options) {
                this.options = options;
            }

            clearTimeout(this.debounce);
            this.debounce = setTimeout(async () => {
                try {
                    const { data } = await consolaApi.get("/select", {
                        params: {
                            ...this.options,    // page, itemsPerPage, sortBy
                            search: this.search // buscador
                        },
                    });

                    this.records = data.data;
                    this.total = data.total;
                } catch (error) {
                    alert.error("No fue posible obtener los registros.");
                }

                this.loading = false;
            }, 500);
        },

        async getModelo() {
            try {
                const { data } = await modelProductApi.get('/select'); // endpoint para traer marcas
                if (data.code === 200) {
                    this.modelos = data.data; // array de marcas
                }
            } catch (error) {
                alert.error("No se pudieron cargar las marcas.");
            }
        },

        async getEstadosIn() {
            try {
                const { data } = await consolaApi.get('/selectEstados'); // endpoint para traer marcas
                if (data.code === 200) {
                    this.estadoInv = data.data; // array de marcas
                }
            } catch (error) {
                alert.error("No se pudieron cargar las marcas.");
            }
        },

        async getUbicacion() {
            try {
                const { data } = await consolaApi.get('/selectUbicacion'); // endpoint para traer marcas
                if (data.code === 200) {
                    this.ubicacions = data.data; // array de marcas
                }
            } catch (error) {
                alert.error("No se pudieron cargar las marcas.");
            }
        },

        showDetails(item) {
            this.details = { ...item }; // copiar todo
            this.dialogDetails = true;  // abrir modal
        },

        addRecord() {
            this.getModelo();
            this.getEstadosIn();
            this.getUbicacion();
            this.dialog = true;
            this.editedIndex = -1;
            this.editedItem = Object.assign({}, this.defaultItem);
            this.v$.$reset();
        },
    },
};
</script>