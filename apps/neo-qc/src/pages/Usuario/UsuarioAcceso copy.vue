<template>
  <q-page class="q-pa-xs">
    <EncabezadoGenericoPrincipal :tituloVentana="'Administración de accesos de usuario'" />
    <q-splitter  v-model="splitterModel" style="height: 100vh " separator-class="bg-primary" separator-style="width: 3px">
      <!-- Árbol de Usuarios -->
      <template v-slot:before>
        <q-card class="my-card" bordered>
          <div class="q-pa-md q-gutter-sm">
            <q-tree
              :nodes="treeData"
              node-key="id"
              default-expand-all
              @drop="onDrop"
              @dragover="allowDrop"
            >
              <template v-slot:default-header="scope" class="">
                <q-item class="q-pa-none"
                  :data-id="scope.node.id"
                  :draggable="scope.node.type !== 'user'"
                  @dragstart="onDragStart(scope.node)"
                >
                  
                  <q-item-section v-if="scope.node.icon" avatar >
                    <q-icon :name="scope.node.icon" />
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label>{{ scope.node.label }}</q-item-label>
                  </q-item-section>
                  
                  <q-item-section v-if="scope.node.type !== 'user' && !scope.node.icon" >
                    <q-btn
                      
                      color="negative"
                      icon="delete"
                      padding="xs"
                      round
                      size="8px"
                      @click.stop="deleteAccess(scope.node)"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-tree>
          </div>
        </q-card>
      </template>

      <template v-slot:separator>
        <q-avatar color="primary" text-color="white" size="40px" icon="drag_indicator">
          <q-tooltip class="bg-purple text-body2">
            Mantenga presionado y mueva hacia la izquierda o derecha para ampliar rango de visión
          </q-tooltip>
        </q-avatar>
      </template>

      <!-- Paneles de Perfiles, Roles y Accesos -->
      <template v-slot:after>
        <div class="q-pa-md q-gutter-md">
          <!-- Perfiles -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Perfiles</div>
              <q-list bordered>
                <q-item
                  v-for="perfil in perfiles"
                  :key="perfil.value"
                  :draggable="true"
                  @dragstart="onDragStart(perfil, 'profile')"
                >
                  <q-item-section>{{ perfil.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Roles -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Roles</div>
              <q-list bordered>
                <q-item
                  v-for="rol in roles"
                  :key="rol.value"
                  :draggable="true"
                  @dragstart="onDragStart(rol, 'role')"
                >
                  <q-item-section>{{ rol.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Accesos -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Accesos</div>
              <q-list bordered>
                <q-item
                  v-for="access in accessList"
                  :key="access.id"
                  :draggable="true"
                  @dragstart="onDragStart(access, 'access')"
                >
                  <q-item-section>{{ access.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-splitter>

    <!-- Diálogo para Editar/Agregar Accesos -->
    <q-dialog v-model="dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Gestionar Acceso</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitForm">
            <q-select v-model="form.usuario" :options="usuarios" label="Usuario" clearable />
            <q-select v-model="form.perfil" :options="perfiles" label="Perfil" clearable />
            <q-select v-model="form.rol" :options="roles" label="Rol" clearable />
            <q-btn type="submit" label="Guardar" color="primary" />
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import EncabezadoGenericoPrincipal from "../../components/EncabezadoGenericoPrincipal.vue";

const splitterModel = ref(25);
const treeData = ref([]);
const usuarios = ref([]);
const perfiles = ref([]);
const roles = ref([]);
const accessList = ref([
  { id: "access1", label: "Access 1" },
  { id: "access2", label: "Access 2" },
]);

const form = ref({
  id: null,
  usuario: null,
  perfil: null,
  rol: null,
});
const dialog = ref(false);
const draggedItem = ref(null);

onMounted(async () => {
  // Cargar datos de la API
  const userAccesses = await fetchUserAccesses();
  usuarios.value = await fetchUsuarios();
  perfiles.value = await fetchPerfiles();
  roles.value = await fetchRoles();
  treeData.value = formatTreeData(userAccesses);
});

const fetchUserAccesses = async () => {
  // Simular una llamada a la API para obtener los accesos de usuario
  return [
    { id: "access1", usuario: "user1", perfil: "perfil1", rol: "rol1", label: "Access 1" },
    { id: "access2", usuario: "user2", perfil: "perfil2", rol: "rol2", label: "Access 2" },
    // Otros accesos...
  ];
};

const fetchUsuarios = async () => {
  // Simular una llamada a la API para obtener los usuarios
  return [
    { label: "User 1", value: "user1" },
    { label: "User 2", value: "user2" },
    { label: "User 3", value: "user3" },
    // Otros usuarios...
  ];
};

const fetchPerfiles = async () => {
  // Simular una llamada a la API para obtener los perfiles
  return [
    { label: "Perfil 1", value: "perfil1" },
    { label: "Perfil 2", value: "perfil2" },
    { label: "Perfil 3", value: "perfil3" },
    // Otros perfiles...
  ];
};

const fetchRoles = async () => {
  // Simular una llamada a la API para obtener los roles
  return [
    { label: "Rol 1", value: "rol1" },
    { label: "Rol 2", value: "rol2" },
    { label: "Rol 3", value: "rol3" },
    // Otros roles...
  ];
};

const formatTreeData = (userAccesses) => {
  const usersMap = {};

  // Inicializar usuarios con ramas fijas: Perfiles, Roles y Accesos
  usuarios.value.forEach((usuario) => {
    usersMap[usuario.value] = {
      id: usuario.value,
      label: usuario.label,
      icon: "person",
      avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
      type: "user",
      children: [
        { id: `${usuario.value}-perfiles`, label: "Perfiles", type: "category", icon:"group", children: [] },
        { id: `${usuario.value}-roles`, label: "Roles", type: "category", icon:"settings_accessibility", children: [] },
        { id: `${usuario.value}-accesos`, label: "Accesos", type: "category", icon:"key",children: [] },
      ],
    };
  });

  // Agregar los accesos dinámicos a las ramas correspondientes
  userAccesses.forEach((access) => {
    const userKey = access.usuario;
    const profileNode = usersMap[userKey].children.find((child) => child.label === "Perfiles");
    const roleNode = usersMap[userKey].children.find((child) => child.label === "Roles");
    const accessNode = usersMap[userKey].children.find((child) => child.label === "Accesos");

    profileNode.children.push({
      id: `${userKey}-${access.id}`,
      label: `Perfil: ${access.perfil}`,
      type: "profile",
      ...access,
    });

    roleNode.children.push({
      id: `${userKey}-${access.id}`,
      label: `Rol: ${access.rol}`,
      type: "role",
      ...access,
    });

    accessNode.children.push({
      id: `${userKey}-${access.id}`,
      label: access.label,
      type: "access",
      ...access,
    });
  });

  return Object.values(usersMap);
};

const createAccess = () => {
  form.value = { id: null, usuario: null, perfil: null, rol: null };
  dialog.value = true;
};

const editAccess = (node) => {
  form.value = { ...node };
  dialog.value = true;
};

const deleteAccess = async (node) => {
  // Simular una llamada a la API para eliminar el acceso
  const user = treeData.value.find((u) => u.id === node.usuario);
  user.children.forEach((category) => {
    category.children = category.children.filter((item) => item.id !== node.id);
  });
};

const submitForm = async () => {
  if (form.value.id) {
    // Simular una llamada a la API para actualizar el acceso
  } else {
    // Simular una llamada a la API para crear un nuevo acceso
    const user = treeData.value.find((u) => u.id === form.value.usuario);
    const category = user.children.find((child) => child.label === "Accesos");
    category.children.push({
      id: `${form.value.usuario}-${form.value.perfil}-${form.value.rol}`,
      label: `Perfil: ${form.value.perfil}, Rol: ${form.value.rol}`,
      type: "access",
      ...form.value,
    });
  }
  dialog.value = false;
};

const onDragStart = (item, type) => {
  draggedItem.value = { ...item, type };
};

const onDrop = (event) => {
  event.preventDefault();
  const dropTarget = event.target.closest(".q-item");
  if (!dropTarget) return;

  const userId = dropTarget.dataset.id;
  const user = treeData.value.find((u) => u.id === userId);
  if (!user) return;

  const { id, label, type } = draggedItem.value;
  if (type === "access") {
    user.children.find((child) => child.label === "Accesos").children.push({
      id: `${userId}-${id}`,
      label,
      type: "access",
    });
  } else if (type === "role") {
    user.children.find((child) => child.label === "Roles").children.push({
      id: `${userId}-${id}`,
      label: `Rol: ${label}`,
      type: "role",
    });
  } else if (type === "profile") {
    user.children.find((child) => child.label === "Perfiles").children.push({
      id: `${userId}-${id}`,
      label: `Perfil: ${label}`,
      type: "profile",
    });
  }
  draggedItem.value = null;
};

const allowDrop = (event) => {
  event.preventDefault();
};
</script>

<style lang="scss" scoped>
.q-card {
  max-width: 300px;
  margin-bottom: 16px;
}
.q-item {
  cursor: pointer;
}
.my-card {
  width: 100%;
  max-width: 99%;
}
</style>
