import React, { useEffect, useState } from "react";
import { Avatar, List, Button, Modal, Input, Switch, FloatButton } from "antd";
import styles from "../styles/Pages/Admin.module.css";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faUser, faRotateLeft, faPlus, faCircleUser } from "@fortawesome/free-solid-svg-icons";
const { Search } = Input;

const Admin = () => {
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [createUserPassword, setCreateUserPassword] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedIsAdmin, setEditedIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
  const [isAdminFilterActive, setIsAdminFilterActive] = useState(false);


  const user = useSelector((state) => state.user.value);
  const router = useRouter();

  useEffect(() => {
    if (!user.token) {
      router.push("/");
    }
  }, [user.token, router]);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3000/users/allUser");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      const formattedData = data.data.map((user) => ({
        key: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin !== undefined ? user.isAdmin.toString() : "",
      }));
      setUserData(formattedData);
    } catch (error) {
      console.error("Erreur lors du fetch des données : ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [createUserModalVisible]);

  const handleEditClick = (key) => {
    const userToEdit = userData.find((user) => user.key === key);
    setSelectedUser(userToEdit);
    setEditedUsername(userToEdit.username);
    setEditedEmail(userToEdit.email);
    setEditedIsAdmin(userToEdit.isAdmin === "true");
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/users/updateUser/${selectedUser.key}`,
        {
          method: "PUT",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            isAdmin: editedIsAdmin,
            username: editedUsername,
            email: editedEmail,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        const updatedUserData = userData.map((user) =>
          user.key === selectedUser.key
            ? {
              ...user,
              isAdmin: editedIsAdmin.toString(),
              username: editedUsername,
              email: editedEmail,
            }
            : user
        );

        setUserData(updatedUserData);
      } else {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du user: ", error);
    } finally {
      setModalVisible(false);
    }
  };

  const handleDeleteUser = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:3000/users/${selectedUser.email}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          const data = await response.json();

          const updatedUserData = userData.filter(
            (user) => user.key !== selectedUser.key
          );

          setUserData(updatedUserData);
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du user: ", error);
      } finally {
        setModalVisible(false);
      }
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleCreateUserClick = () => {
    setEditedUsername("");
    setEditedEmail("");
    setCreateUserPassword("")
    setEditedIsAdmin(false);
    setCreateUserModalVisible(true);
  };

  const handleCreateUserModalClose = () => {
    setCreateUserModalVisible(false);
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/users/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: editedUsername,
          password: createUserPassword,
          email: editedEmail,
          isAdmin: editedIsAdmin,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        fetchData();

        setCreateUserModalVisible(false);
      } else {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la création du user: ", error);
    }
  };

  const getFilteredData = () => {
    if (isAdminFilterActive) {
      return userData.filter(user => user.isAdmin === "true");
    }
    return userData.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredData = getFilteredData();


  if (user.isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.searchBar}>
          <Search
            placeholder="Search users..."
            allowClear
            onSearch={handleSearch}
            style={{ marginBottom: 16, marginTop: 16 }}
          />
          <Button type="primary" onClick={() => setIsAdminFilterActive(!isAdminFilterActive)}>
            {isAdminFilterActive ? 'Voir tous' : 'Voir Admins'}
          </Button>
          <Button type="primary" onClick={handleCreateUserClick}>
            Create User
          </Button>
        </div>
        <div className={styles.customListContainer}>
          <List
            dataSource={filteredData}
            pagination={{
              position: "bottom",
              align: "center",
            }}
            renderItem={(item) => (
              <List.Item className={styles.listItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <List.Item.Meta
                    avatar={<Avatar src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${item.key}`} />}
                    title={`${item.username}`}
                    description={item.email}
                  />
                  {item.isAdmin.toString() === "true" && (
                    <FontAwesomeIcon icon={faCircleUser} style={{ fontSize: "2em", marginLeft: '1em', marginRight: '1em', color:'white' }} />
                  )}
                  <Button
                    type="primary"
                    className={styles.editButton}
                    onClick={() => handleEditClick(item.key)}
                  >
                    <FontAwesomeIcon icon={faPen} color="white" />
                  </Button>
                </div>
              </List.Item>
            )}
          />
        </div>

        {selectedUser && (
          <Modal
            title={`User information`}
            visible={modalVisible}
            onCancel={handleModalClose}
            footer={[
              <div className={styles.btnEditUser}>
                <Button
                  key="delete"
                  type="primary"
                  danger
                  onClick={handleDeleteUser}
                >
                  <FontAwesomeIcon icon={faTrash} color="white" />
                </Button>

                <Button key="save" type="primary" onClick={handleSaveChanges}>
                  <FontAwesomeIcon icon={faUser} color="white" />
                </Button>
              </div>,
            ]}
          >
            <div className={styles.modalField}>
              <label htmlFor="editedUsername">Username:</label>
              <Input
                id="editedUsername"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
              />
            </div>
            <div className={styles.modalField}>
              <label htmlFor="editedEmail">Email:</label>
              <Input
                id="editedEmail"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
              />
            </div>
            <div className={styles.switchContainer}>
              <label htmlFor="editedIsAdmin">isAdmin:</label>
              <div className={styles.switchField}>
                <Switch
                  id="editedIsAdmin"
                  checked={editedIsAdmin}
                  onChange={(checked) => setEditedIsAdmin(checked)}
                />
              </div>
            </div>
          </Modal>
        )}
        {createUserModalVisible && (
          <Modal
            title={`Create User`}
            visible={createUserModalVisible}
            onCancel={handleCreateUserModalClose}
            footer={[
              <div className={styles.createBtn}>
                <Button key="cancel" className={styles.cancelBtn} onClick={handleCreateUserModalClose}>
                  <FontAwesomeIcon icon={faRotateLeft} color="white" />
                </Button>
                <Button key="create" type="primary" onClick={handleCreateUser}>
                  <FontAwesomeIcon icon={faPlus} color="white" />
                </Button>
              </div>,
            ]}
          >
            <div className={styles.modalField}>
              <label htmlFor="editedUsername">Username:</label>
              <Input
                id="editedUsername"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
              />
            </div>
            <div className={styles.modalField}>
              <label htmlFor="editedEmail">Email:</label>
              <Input
                id="editedEmail"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
              />
            </div>
            <div className={styles.modalField}>
              <label htmlFor="createUserPassword">Password:</label>
              <Input
                id="createUserPassword"
                type="password"
                value={createUserPassword}
                onChange={(e) => setCreateUserPassword(e.target.value)}
              />
            </div>
            <div className={styles.switchContainer}>
              <label htmlFor="editedIsAdmin">isAdmin:</label>
              <div className={styles.switchField}>
                <Switch
                  id="editedIsAdmin"
                  checked={editedIsAdmin}
                  onChange={(checked) => setEditedIsAdmin(checked)}
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <h1>This page is not allowed to intern</h1>
      </div>
    );
  }
};

export default Admin;
